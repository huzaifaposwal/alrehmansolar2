from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import FAQ
from app.schemas.schemas import FAQCreate, FAQOut
import uuid

router = APIRouter(prefix="/faqs", tags=["faqs"])


@router.get("", response_model=list[FAQOut])
async def list_faqs(
    published_only: bool = True,
    category: str = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(FAQ).order_by(FAQ.display_order, FAQ.created_at)
    if published_only:
        query = query.where(FAQ.is_published == True)
    if category:
        query = query.where(FAQ.category == category)
    result = await db.execute(query)
    return [FAQOut.model_validate(f) for f in result.scalars().all()]


@router.post("", response_model=FAQOut, status_code=201)
async def create_faq(
    payload: FAQCreate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    faq = FAQ(**payload.model_dump())
    db.add(faq)
    await db.commit()
    await db.refresh(faq)
    return FAQOut.model_validate(faq)


@router.put("/{faq_id}", response_model=FAQOut)
async def update_faq(
    faq_id: uuid.UUID,
    payload: FAQCreate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FAQ).where(FAQ.id == faq_id))
    faq = result.scalar_one_or_none()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    for k, v in payload.model_dump().items():
        setattr(faq, k, v)
    await db.commit()
    await db.refresh(faq)
    return FAQOut.model_validate(faq)


@router.delete("/{faq_id}", status_code=204)
async def delete_faq(
    faq_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FAQ).where(FAQ.id == faq_id))
    faq = result.scalar_one_or_none()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    await db.delete(faq)
    await db.commit()
