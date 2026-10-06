from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import BlogPost, BlogCategory
from app.schemas.schemas import BlogPostCreate, BlogPostOut, BlogPostUpdate, BlogPostSummary, BlogCategoryOut
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/blog", tags=["blog"])


# ─── Categories ───────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[BlogCategoryOut])
async def list_blog_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogCategory).order_by(BlogCategory.name))
    return [BlogCategoryOut.model_validate(c) for c in result.scalars().all()]


@router.post("/categories", response_model=BlogCategoryOut, status_code=201)
async def create_blog_category(
    name: str, slug: str, description: Optional[str] = None,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cat = BlogCategory(name=name, slug=slug, description=description)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return BlogCategoryOut.model_validate(cat)


# ─── Posts ────────────────────────────────────────────────────────────────────

@router.get("", response_model=dict)
async def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category_slug: Optional[str] = None,
    published_only: bool = True,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(BlogPost)
        .options(selectinload(BlogPost.category))
        .order_by(BlogPost.published_at.desc(), BlogPost.created_at.desc())
    )
    if published_only:
        query = query.where(BlogPost.is_published == True)
    if category_slug:
        query = query.join(BlogCategory).where(BlogCategory.slug == category_slug)
    if search:
        query = query.where(BlogPost.title.ilike(f"%{search}%"))

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()

    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    items = result.scalars().all()

    return {
        "items": [BlogPostSummary.model_validate(p) for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{slug}", response_model=BlogPostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BlogPost).options(selectinload(BlogPost.category)).where(BlogPost.slug == slug)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPostOut.model_validate(post)


@router.post("", response_model=BlogPostOut, status_code=201)
async def create_post(
    payload: BlogPostCreate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = payload.model_dump()
    if data.get("is_published") and not data.get("published_at"):
        data["published_at"] = datetime.now(timezone.utc)
    post = BlogPost(**data)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    result = await db.execute(
        select(BlogPost).options(selectinload(BlogPost.category)).where(BlogPost.id == post.id)
    )
    return BlogPostOut.model_validate(result.scalar_one())


@router.put("/{post_id}", response_model=BlogPostOut)
async def update_post(
    post_id: uuid.UUID,
    payload: BlogPostUpdate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    data = payload.model_dump(exclude_none=True)
    if data.get("is_published") and not post.published_at:
        data["published_at"] = datetime.now(timezone.utc)
    for k, v in data.items():
        setattr(post, k, v)
    await db.commit()
    result = await db.execute(
        select(BlogPost).options(selectinload(BlogPost.category)).where(BlogPost.id == post_id)
    )
    return BlogPostOut.model_validate(result.scalar_one())


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    await db.delete(post)
    await db.commit()
