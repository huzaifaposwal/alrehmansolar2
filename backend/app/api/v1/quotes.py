"""Quote Request management API — Al Rehman Solar"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import QuoteRequest, Lead, LeadStatus
from app.schemas.schemas import (
    QuoteRequestCreate, QuoteRequestOut, QuoteRequestUpdate, LeadOut,
)
import uuid

router = APIRouter(prefix="/quotes", tags=["quotes"])


@router.post("", response_model=QuoteRequestOut, status_code=201)
async def create_quote_request(payload: QuoteRequestCreate, db: AsyncSession = Depends(get_db)):
    """Public endpoint — submitted from quote/calculator form."""
    quote = QuoteRequest(**payload.model_dump())
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    return QuoteRequestOut.model_validate(quote)


@router.get("", response_model=dict)
async def list_quotes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin only — list/filter/search quote requests."""
    sort_col = getattr(QuoteRequest, sort_by, QuoteRequest.created_at)
    order = sort_col.desc() if sort_order == "desc" else sort_col.asc()
    query = select(QuoteRequest).order_by(order)

    if status:
        query = query.where(QuoteRequest.status == status)
    if search:
        query = query.where(
            or_(
                QuoteRequest.full_name.ilike(f"%{search}%"),
                QuoteRequest.email.ilike(f"%{search}%"),
                QuoteRequest.phone.ilike(f"%{search}%"),
            )
        )

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()

    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    quotes = result.scalars().all()

    return {
        "items": [QuoteRequestOut.model_validate(q) for q in quotes],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{quote_id}", response_model=QuoteRequestOut)
async def get_quote(
    quote_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(QuoteRequest).where(QuoteRequest.id == quote_id))
    quote = result.scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote request not found")
    return QuoteRequestOut.model_validate(quote)


@router.put("/{quote_id}", response_model=QuoteRequestOut)
async def update_quote(
    quote_id: uuid.UUID,
    payload: QuoteRequestUpdate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(QuoteRequest).where(QuoteRequest.id == quote_id))
    quote = result.scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote request not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(quote, k, v)
    await db.commit()
    await db.refresh(quote)
    return QuoteRequestOut.model_validate(quote)


@router.delete("/{quote_id}", status_code=204)
async def delete_quote(
    quote_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(QuoteRequest).where(QuoteRequest.id == quote_id))
    quote = result.scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote request not found")
    await db.delete(quote)
    await db.commit()


@router.post("/{quote_id}/convert-to-lead", response_model=LeadOut)
async def convert_to_lead(
    quote_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Convert a quote request into a lead."""
    result = await db.execute(select(QuoteRequest).where(QuoteRequest.id == quote_id))
    quote = result.scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote request not found")
    if quote.lead_id:
        raise HTTPException(status_code=400, detail="Quote already converted to a lead")

    lead = Lead(
        full_name=quote.full_name,
        phone=quote.phone,
        email=quote.email,
        city=quote.city,
        property_type=quote.property_type,
        monthly_bill=quote.monthly_bill,
        monthly_units=quote.monthly_units,
        preferred_system=quote.preferred_system,
        roof_size=quote.roof_size,
        message=quote.message,
        status=LeadStatus.new,
        source="quote_conversion",
    )
    db.add(lead)
    await db.flush()

    from app.models.models import QuoteStatus
    quote.lead_id = lead.id
    quote.status = QuoteStatus.converted
    await db.commit()
    await db.refresh(lead)
    return LeadOut.model_validate(lead)
