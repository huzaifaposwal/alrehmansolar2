from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Project, ProjectImage
from app.schemas.schemas import ProjectCreate, ProjectOut, ProjectUpdate, ProjectImageOut
import uuid

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=dict)
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    project_type: Optional[str] = None,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Project)
        .options(selectinload(Project.images))
        .order_by(Project.is_featured.desc(), Project.completion_date.desc())
    )
    if project_type:
        query = query.where(Project.project_type == project_type)
    if featured is not None:
        query = query.where(Project.is_featured == featured)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar()

    result = await db.execute(query.offset((page - 1) * page_size).limit(page_size))
    items = result.scalars().all()

    return {
        "items": [ProjectOut.model_validate(p) for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{slug}", response_model=ProjectOut)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).options(selectinload(Project.images)).where(Project.slug == slug)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectOut.model_validate(project)


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    payload: ProjectCreate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(**payload.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    result = await db.execute(
        select(Project).options(selectinload(Project.images)).where(Project.id == project.id)
    )
    return ProjectOut.model_validate(result.scalar_one())


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(project, k, v)
    await db.commit()
    result = await db.execute(
        select(Project).options(selectinload(Project.images)).where(Project.id == project_id)
    )
    return ProjectOut.model_validate(result.scalar_one())


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()


@router.post("/{project_id}/images", response_model=ProjectImageOut, status_code=201)
async def add_project_image(
    project_id: uuid.UUID,
    url: str,
    alt: Optional[str] = None,
    is_primary: bool = False,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    img = ProjectImage(project_id=project_id, url=url, alt=alt, is_primary=is_primary)
    db.add(img)
    await db.commit()
    await db.refresh(img)
    return ProjectImageOut.model_validate(img)


@router.delete("/images/{image_id}", status_code=204)
async def delete_project_image(
    image_id: uuid.UUID,
    current: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ProjectImage).where(ProjectImage.id == image_id))
    img = result.scalar_one_or_none()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(img)
    await db.commit()
