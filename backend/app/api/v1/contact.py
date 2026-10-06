from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import ContactMessage
from app.schemas.schemas import ContactCreate, ContactOut
from sqlalchemy import select
import uuid

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactOut, status_code=201)
async def submit_contact(payload: ContactCreate, db: AsyncSession = Depends(get_db)):
    msg = ContactMessage(**payload.model_dump())
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return ContactOut.model_validate(msg)


@router.get("", response_model=list[ContactOut])
async def list_messages(db: AsyncSession = Depends(get_db)):
    from app.core.security import get_current_user
    result = await db.execute(
        select(ContactMessage).order_by(ContactMessage.created_at.desc())
    )
    return [ContactOut.model_validate(m) for m in result.scalars().all()]


@router.put("/{msg_id}/read", response_model=ContactOut)
async def mark_read(msg_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == msg_id))
    msg = result.scalar_one_or_none()
    if msg:
        msg.is_read = True
        await db.commit()
        await db.refresh(msg)
    return ContactOut.model_validate(msg)
