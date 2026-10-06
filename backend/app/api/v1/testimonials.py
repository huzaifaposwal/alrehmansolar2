from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Testimonial
from app.schemas.schemas import TestimonialCreate, TestimonialOut
import uuid

router = APIRouter(prefix="/testimonials", tags=["testimonials"])


@router.get("", response_model=list[TestimonialOut])
async def list_testimonials(published_only: bool = True, db: AsyncSession = Depends(get_db)):
    query = select(Testimonial).order_by(Testimonial.display_order, Testimonial.created_at.desc())
    if published_only:
        query = query.where(Testimonial.is_published == True)
    result = await db.execute(query)
    return [TestimonialOut.model_validate(t) for t in result.scalars().all()]


@router.post("", response_model=TestimonialOut, status_code=201)
async def create_testimonial(
    payload: TestimonialCreate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t = Testimonial(**payload.model_dump())
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return TestimonialOut.model_validate(t)


@router.put("/{tid}", response_model=TestimonialOut)
async def update_testimonial(
    tid: uuid.UUID,
    payload: TestimonialCreate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Testimonial).where(Testimonial.id == tid))
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    for k, v in payload.model_dump().items():
        setattr(t, k, v)
    await db.commit()
    await db.refresh(t)
    return TestimonialOut.model_validate(t)


@router.delete("/{tid}", status_code=204)
async def delete_testimonial(
    tid: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Testimonial).where(Testimonial.id == tid))
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    await db.delete(t)
    await db.commit()
