"""
Pydantic v2 schemas — Al Rehman Solar
Request / Response models for all API endpoints.
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.models import LeadStatus, UserRole, QuoteStatus


# ─── Shared ───────────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    role: UserRole = UserRole.admin


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


# ─── Leads ────────────────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=7, max_length=30)
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    property_type: Optional[str] = None
    monthly_bill: Optional[float] = Field(None, ge=0)
    monthly_units: Optional[float] = Field(None, ge=0)
    preferred_system: Optional[str] = None
    roof_size: Optional[float] = Field(None, ge=0)
    message: Optional[str] = None
    source: str = "website"


class LeadUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    property_type: Optional[str] = None
    monthly_bill: Optional[float] = None
    monthly_units: Optional[float] = None
    preferred_system: Optional[str] = None
    roof_size: Optional[float] = None
    message: Optional[str] = None
    status: Optional[LeadStatus] = None
    notes: Optional[str] = None
    source: Optional[str] = None


class LeadOut(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str
    email: Optional[str]
    city: Optional[str]
    property_type: Optional[str]
    monthly_bill: Optional[float]
    monthly_units: Optional[float]
    preferred_system: Optional[str]
    roof_size: Optional[float]
    message: Optional[str]
    status: LeadStatus
    notes: Optional[str]
    source: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Contact ──────────────────────────────────────────────────────────────────

class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    phone: Optional[str] = None
    email: EmailStr
    subject: Optional[str] = None
    message: str = Field(min_length=10)


class ContactOut(BaseModel):
    id: uuid.UUID
    name: str
    phone: Optional[str]
    email: str
    subject: Optional[str]
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Quote Requests ──────────────────────────────────────────────────────────

class QuoteRequestCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=7, max_length=30)
    email: Optional[EmailStr] = None
    city: Optional[str] = None
    property_type: Optional[str] = None
    monthly_bill: Optional[float] = Field(None, ge=0)
    monthly_units: Optional[float] = Field(None, ge=0)
    preferred_system: Optional[str] = None
    roof_size: Optional[float] = Field(None, ge=0)
    recommended_system: Optional[str] = None
    estimated_price: Optional[float] = Field(None, ge=0)
    message: Optional[str] = None
    source: str = "website"


class QuoteRequestUpdate(BaseModel):
    status: Optional[QuoteStatus] = None
    notes: Optional[str] = None
    recommended_system: Optional[str] = None
    estimated_price: Optional[float] = None


class QuoteRequestOut(BaseModel):
    id: uuid.UUID
    full_name: str
    phone: str
    email: Optional[str]
    city: Optional[str]
    property_type: Optional[str]
    monthly_bill: Optional[float]
    monthly_units: Optional[float]
    preferred_system: Optional[str]
    roof_size: Optional[float]
    recommended_system: Optional[str]
    estimated_price: Optional[float]
    message: Optional[str]
    notes: Optional[str]
    status: QuoteStatus
    source: str
    lead_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Product Categories ───────────────────────────────────────────────────────

class ProductCategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    display_order: int = 0


class ProductCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str]
    display_order: int

    model_config = {"from_attributes": True}


# ─── Products ─────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    slug: str
    brand: Optional[str] = None
    model: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    images: Optional[List[str]] = None
    price: Optional[float] = Field(None, ge=0)
    is_available: bool = True
    is_featured: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class ProductUpdate(ProductCreate):
    name: Optional[str] = None
    slug: Optional[str] = None


class ProductOut(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    brand: Optional[str]
    model: Optional[str]
    category_id: Optional[uuid.UUID]
    category: Optional[ProductCategoryOut]
    description: Optional[str]
    specifications: Optional[Dict[str, Any]]
    images: Optional[List[str]]
    price: Optional[float]
    is_available: bool
    is_featured: bool
    seo_title: Optional[str]
    seo_description: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Projects ─────────────────────────────────────────────────────────────────

class ProjectImageOut(BaseModel):
    id: uuid.UUID
    url: str
    alt: Optional[str]
    is_primary: bool
    display_order: int

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    title: str
    slug: str
    location: Optional[str] = None
    capacity_kw: Optional[float] = Field(None, ge=0)
    project_type: Optional[str] = None
    system_type: Optional[str] = None
    completion_date: Optional[datetime] = None
    description: Optional[str] = None
    components: Optional[List[str]] = None
    results: Optional[str] = None
    is_featured: bool = False
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


class ProjectUpdate(ProjectCreate):
    title: Optional[str] = None
    slug: Optional[str] = None


class ProjectOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    location: Optional[str]
    capacity_kw: Optional[float]
    project_type: Optional[str]
    system_type: Optional[str]
    completion_date: Optional[datetime]
    description: Optional[str]
    components: Optional[List[str]]
    results: Optional[str]
    is_featured: bool
    images: List[ProjectImageOut]
    seo_title: Optional[str]
    seo_description: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Blog ─────────────────────────────────────────────────────────────────────

class BlogCategoryOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str]

    model_config = {"from_attributes": True}


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=3)
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image: Optional[str] = None
    author: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    tags: Optional[List[str]] = None
    is_published: bool = False
    published_at: Optional[datetime] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    read_time_minutes: Optional[int] = None


class BlogPostUpdate(BlogPostCreate):
    title: Optional[str] = None
    slug: Optional[str] = None


class BlogPostOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    excerpt: Optional[str]
    content: Optional[str]
    featured_image: Optional[str]
    author: Optional[str]
    category_id: Optional[uuid.UUID]
    category: Optional[BlogCategoryOut]
    tags: Optional[List[str]]
    is_published: bool
    published_at: Optional[datetime]
    seo_title: Optional[str]
    seo_description: Optional[str]
    read_time_minutes: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BlogPostSummary(BaseModel):
    """Lightweight version for list pages — no full content."""
    id: uuid.UUID
    slug: str
    title: str
    excerpt: Optional[str]
    featured_image: Optional[str]
    author: Optional[str]
    category: Optional[BlogCategoryOut]
    tags: Optional[List[str]]
    is_published: bool
    published_at: Optional[datetime]
    read_time_minutes: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Testimonials ─────────────────────────────────────────────────────────────

class TestimonialCreate(BaseModel):
    customer_name: str
    location: Optional[str] = None
    rating: int = Field(5, ge=1, le=5)
    review: str
    review_date: Optional[datetime] = None
    image_url: Optional[str] = None
    is_published: bool = False
    display_order: int = 0


class TestimonialOut(BaseModel):
    id: uuid.UUID
    customer_name: str
    location: Optional[str]
    rating: int
    review: str
    review_date: Optional[datetime]
    image_url: Optional[str]
    is_published: bool
    display_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── FAQs ─────────────────────────────────────────────────────────────────────

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    display_order: int = 0
    is_published: bool = False


class FAQOut(BaseModel):
    id: uuid.UUID
    question: str
    answer: str
    category: Optional[str]
    display_order: int
    is_published: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Settings ─────────────────────────────────────────────────────────────────

class SettingUpdate(BaseModel):
    value: Optional[str] = None
    value_json: Optional[Dict[str, Any]] = None


class SettingOut(BaseModel):
    key: str
    value: Optional[str]
    value_json: Optional[Dict[str, Any]]
    label: Optional[str]
    group: Optional[str]
    updated_at: datetime

    model_config = {"from_attributes": True}


class BulkSettingsUpdate(BaseModel):
    settings: Dict[str, str]  # key -> value


# ─── Calculator ───────────────────────────────────────────────────────────────

class CalculatorInput(BaseModel):
    monthly_bill_pkr: Optional[float] = Field(None, ge=0, description="Monthly electricity bill in PKR")
    monthly_units_kwh: Optional[float] = Field(None, ge=0, description="Monthly consumption in kWh")
    city: str = "Lahore"
    property_type: str = "residential"
    system_type: str = "hybrid"
    roof_size_sqft: Optional[float] = Field(None, ge=0)

    @field_validator("system_type")
    @classmethod
    def validate_system_type(cls, v):
        allowed = {"on_grid", "off_grid", "hybrid"}
        if v not in allowed:
            raise ValueError(f"system_type must be one of {allowed}")
        return v


class CalculatorResult(BaseModel):
    recommended_capacity_kw: float
    estimated_monthly_generation_kwh: float
    estimated_monthly_savings_pkr: float
    estimated_annual_savings_pkr: float
    estimated_payback_years: float
    estimated_co2_reduction_kg_year: float
    system_type: str
    disclaimer: str
    assumptions: Dict[str, Any]


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    new_leads: int
    total_leads: int
    contacted_leads: int
    converted_leads: int
    quote_requests: int
    unread_messages: int
    total_products: int
    total_projects: int
    published_blog_posts: int
    published_testimonials: int
    published_faqs: int


# ─── Activity Log ─────────────────────────────────────────────────────────────

class ActivityLogOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    user_email: Optional[str]
    action: str
    entity: str
    entity_id: Optional[str]
    details: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── AI Chat ──────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    source: str = "ai"  # "ai" or "faq_fallback"
