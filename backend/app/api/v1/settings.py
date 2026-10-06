"""Site Settings + Dashboard Stats API — Al Rehman Solar"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    SiteSetting, SEOSetting, Lead, ContactMessage, Product, Project,
    BlogPost, Testimonial, FAQ, LeadStatus, QuoteRequest, ActivityLog,
)
from app.schemas.schemas import SettingOut, SettingUpdate, BulkSettingsUpdate, DashboardStats, ActivityLogOut

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=list[SettingOut])
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    """Public — frontend uses this for business info, nav, footer, etc."""
    result = await db.execute(select(SiteSetting).order_by(SiteSetting.group, SiteSetting.key))
    return [SettingOut.model_validate(s) for s in result.scalars().all()]


@router.get("/{key}", response_model=SettingOut)
async def get_setting(key: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return SettingOut.model_validate(setting)


@router.put("/{key}", response_model=SettingOut)
async def update_setting(
    key: str,
    payload: SettingUpdate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        # Auto-create if doesn't exist
        setting = SiteSetting(key=key, value=payload.value, value_json=payload.value_json)
        db.add(setting)
    else:
        if payload.value is not None:
            setting.value = payload.value
        if payload.value_json is not None:
            setting.value_json = payload.value_json
    await db.commit()
    await db.refresh(setting)
    return SettingOut.model_validate(setting)


@router.post("/bulk", response_model=dict)
async def bulk_update_settings(
    payload: BulkSettingsUpdate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple settings in one request. Auto-creates missing keys."""
    updated = 0
    for key, value in payload.settings.items():
        result = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
        else:
            db.add(SiteSetting(key=key, value=value))
        updated += 1
    await db.commit()
    return {"updated": updated}


@router.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async def count(model, **filters):
        q = select(func.count()).select_from(model)
        for k, v in filters.items():
            q = q.where(getattr(model, k) == v)
        r = await db.execute(q)
        return r.scalar()

    return DashboardStats(
        new_leads=await count(Lead, status=LeadStatus.new),
        total_leads=await count(Lead),
        contacted_leads=await count(Lead, status=LeadStatus.contacted),
        converted_leads=await count(Lead, status=LeadStatus.converted),
        quote_requests=await count(QuoteRequest),
        unread_messages=await count(ContactMessage, is_read=False),
        total_products=await count(Product),
        total_projects=await count(Project),
        published_blog_posts=await count(BlogPost, is_published=True),
        published_testimonials=await count(Testimonial, is_published=True),
        published_faqs=await count(FAQ, is_published=True),
    )


@router.get("/dashboard/lead-stats", response_model=dict)
async def lead_status_stats(
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns lead count grouped by status — for dashboard charts."""
    result = await db.execute(
        select(Lead.status, func.count(Lead.id))
        .group_by(Lead.status)
    )
    data = {row[0]: row[1] for row in result.all()}
    return {"lead_stats": data}


@router.get("/dashboard/recent-activity", response_model=dict)
async def recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns recent activity log entries for the dashboard."""
    result = await db.execute(
        select(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    )
    entries = result.scalars().all()
    return {"items": [ActivityLogOut.model_validate(e) for e in entries]}
