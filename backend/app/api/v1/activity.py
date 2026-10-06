"""Activity Log API + helper — Al Rehman Solar"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import ActivityLog
from app.schemas.schemas import ActivityLogOut
import uuid

router = APIRouter(prefix="/activity", tags=["activity"])


async def log_activity(
    db: AsyncSession,
    *,
    user_id: Optional[uuid.UUID] = None,
    user_email: Optional[str] = None,
    action: str,
    entity: str,
    entity_id: Optional[str] = None,
    details: Optional[str] = None,
):
    """Helper to record an admin action in the activity log."""
    entry = ActivityLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id else None,
        details=details,
    )
    db.add(entry)
    # Flush but don't commit — let the caller's transaction commit it
    await db.flush()
    return entry


@router.get("", response_model=dict)
async def list_activity(
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    entity: Optional[str] = None,
    action: Optional[str] = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin only — paginated activity log."""
    query = select(ActivityLog).order_by(ActivityLog.created_at.desc())

    if entity:
        query = query.where(ActivityLog.entity == entity)
    if action:
        query = query.where(ActivityLog.action == action)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()

    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    entries = result.scalars().all()

    return {
        "items": [ActivityLogOut.model_validate(e) for e in entries],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }
