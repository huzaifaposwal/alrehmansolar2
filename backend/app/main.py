from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import select, text
from pathlib import Path
import logging

from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal, Base
from app.core.security import get_password_hash
from app.models.models import User, UserRole, SiteSetting, FAQ, ProductCategory, BlogCategory
from app.api.v1 import (
    auth, leads, products, projects, blog, contact, calculator,
    faqs, testimonials, settings as settings_router,
    quotes, activity, upload,
)

logger = logging.getLogger(__name__)


# ─── Seed Data ────────────────────────────────────────────────────────────────

DEFAULT_SETTINGS = [
    # Business Info
    {"key": "business_name", "value": "Al Rehman Solar System & UPS", "label": "Business Name", "group": "business"},
    {"key": "phone", "value": "+92-300-0000000", "label": "Phone Number", "group": "business"},
    {"key": "whatsapp", "value": "923000000000", "label": "WhatsApp Number (with country code)", "group": "business"},
    {"key": "email", "value": "info@alrehmansolars.com", "label": "Email Address", "group": "business"},
    {"key": "address", "value": "Lahore, Punjab, Pakistan", "label": "Office Address", "group": "business"},
    {"key": "business_hours", "value": "Mon–Sat: 9:00 AM – 6:00 PM", "label": "Business Hours", "group": "business"},
    {"key": "tagline", "value": "Reliable Solar & UPS Solutions in Lahore", "label": "Tagline", "group": "business"},
    # Social
    {"key": "facebook_url", "value": "", "label": "Facebook URL", "group": "social"},
    {"key": "instagram_url", "value": "", "label": "Instagram URL", "group": "social"},
    {"key": "youtube_url", "value": "", "label": "YouTube URL", "group": "social"},
    {"key": "linkedin_url", "value": "", "label": "LinkedIn URL", "group": "social"},
    # Stats (configurable — admin enters real values)
    {"key": "stat_projects_completed", "value": "0", "label": "Projects Completed", "group": "stats"},
    {"key": "stat_installed_capacity_kw", "value": "0", "label": "Installed Capacity (kW)", "group": "stats"},
    {"key": "stat_years_experience", "value": "0", "label": "Years of Experience", "group": "stats"},
    {"key": "stat_happy_customers", "value": "0", "label": "Happy Customers", "group": "stats"},
    # SEO defaults
    {"key": "seo_default_title", "value": "Al Rehman Solar System & UPS — Lahore", "label": "Default SEO Title", "group": "seo"},
    {"key": "seo_default_description", "value": "Professional solar panel installation, hybrid solar systems, UPS solutions and solar inverters in Lahore, Pakistan.", "label": "Default SEO Description", "group": "seo"},
    {"key": "google_maps_embed", "value": "", "label": "Google Maps Embed URL", "group": "contact"},
    {"key": "footer_text", "value": "© 2024 Al Rehman Solar System & UPS. All rights reserved.", "label": "Footer Copyright Text", "group": "business"},
    # Calculator Settings
    {"key": "calc_electricity_tariff_pkr_per_kwh", "value": "50", "label": "Electricity Rate (PKR/kWh)", "group": "calculator"},
    {"key": "calc_peak_sun_hours_per_day", "value": "5.0", "label": "Peak Sun Hours/Day", "group": "calculator"},
    {"key": "calc_system_efficiency", "value": "80", "label": "System Efficiency (%)", "group": "calculator"},
    {"key": "calc_kw_per_100_sqft", "value": "1.0", "label": "kW per 100 sqft", "group": "calculator"},
    {"key": "calc_cost_per_kw_pkr", "value": "120000", "label": "Cost per kW (PKR)", "group": "calculator"},
    {"key": "calc_self_consumption_ratio", "value": "85", "label": "Self Consumption (%)", "group": "calculator"},
    {"key": "calc_co2_kg_per_kwh", "value": "0.47", "label": "CO₂ Factor (kg/kWh)", "group": "calculator"},
    # Social Media
    {"key": "tiktok_url", "value": "", "label": "TikTok URL", "group": "social"},
]

DEFAULT_FAQS = [
    {"question": "What is an on-grid solar system?", "answer": "An on-grid or grid-tied solar system is connected to the utility grid. It generates solar electricity during the day, which is used by your home or business. Any excess electricity can be fed back to the grid. This system does not include battery storage and does not work during a power outage.", "category": "Solar Systems", "display_order": 1, "is_published": True},
    {"question": "What is a hybrid solar system?", "answer": "A hybrid solar system combines solar panels, a battery bank, and a grid connection. It stores excess solar energy in batteries for use at night or during load shedding, while remaining connected to the grid as a backup. Hybrid systems are popular in Pakistan due to frequent load shedding.", "category": "Solar Systems", "display_order": 2, "is_published": True},
    {"question": "What is an off-grid solar system?", "answer": "An off-grid solar system operates independently from the utility grid. It uses solar panels to charge a battery bank, which powers your home or business. This system is ideal for areas with no grid connection or very unreliable electricity supply.", "category": "Solar Systems", "display_order": 3, "is_published": True},
    {"question": "How many solar panels does a home need?", "answer": "The number of solar panels depends on your monthly electricity consumption, available roof space, and the system capacity you require. As a general guide, a 5 kW system typically requires 10–14 solar panels. Contact us for a proper site assessment and customized recommendation.", "category": "Installation", "display_order": 4, "is_published": True},
    {"question": "How long does solar installation take?", "answer": "A standard residential solar installation typically takes 1–3 days, depending on the system size and complexity. Commercial and industrial installations may take longer. We will provide a project timeline during your consultation.", "category": "Installation", "display_order": 5, "is_published": True},
    {"question": "What maintenance does a solar system require?", "answer": "Solar panels require minimal maintenance. Regular cleaning to remove dust and debris is recommended, especially in Lahore where dust accumulation is common. Inverters and batteries should be inspected periodically. We offer after-sales support and maintenance services.", "category": "Maintenance", "display_order": 6, "is_published": True},
    {"question": "Can solar work during load shedding?", "answer": "On-grid systems do not work during load shedding for safety reasons. However, hybrid and off-grid solar systems with battery storage will continue to power your home or business during load shedding, making them ideal for Pakistan's power situation.", "category": "Solar Systems", "display_order": 7, "is_published": True},
    {"question": "What is the difference between solar and UPS?", "answer": "A UPS (Uninterruptible Power Supply) provides short-term backup power from batteries charged by the grid. A solar system generates its own electricity from sunlight and can charge batteries independently. Solar systems provide long-term energy independence, while a UPS is typically used for short power interruptions.", "category": "UPS", "display_order": 8, "is_published": True},
]

DEFAULT_PRODUCT_CATEGORIES = [
    {"name": "Solar Panels", "slug": "solar-panels", "display_order": 1},
    {"name": "Solar Inverters", "slug": "solar-inverters", "display_order": 2},
    {"name": "Batteries", "slug": "batteries", "display_order": 3},
    {"name": "UPS Systems", "slug": "ups-systems", "display_order": 4},
    {"name": "Solar Accessories", "slug": "solar-accessories", "display_order": 5},
]

DEFAULT_BLOG_CATEGORIES = [
    {"name": "Solar Energy", "slug": "solar-energy"},
    {"name": "Solar Guides", "slug": "solar-guides"},
    {"name": "Solar Panels", "slug": "solar-panels"},
    {"name": "Solar Inverters", "slug": "solar-inverters"},
    {"name": "Batteries", "slug": "batteries"},
    {"name": "Energy Saving", "slug": "energy-saving"},
    {"name": "UPS", "slug": "ups"},
    {"name": "Renewable Energy", "slug": "renewable-energy"},
]


async def seed_database():
    async with AsyncSessionLocal() as db:
        # ── Admin user ──────────────────────────────────────────────────────
        result = await db.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
        if not result.scalar_one_or_none():
            admin = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="Admin",
                role=UserRole.super_admin,
            )
            db.add(admin)
            logger.info(f"Created admin user: {settings.ADMIN_EMAIL}")

        # ── Site settings ───────────────────────────────────────────────────
        for s in DEFAULT_SETTINGS:
            result = await db.execute(select(SiteSetting).where(SiteSetting.key == s["key"]))
            if not result.scalar_one_or_none():
                db.add(SiteSetting(**s))

        # ── FAQs ────────────────────────────────────────────────────────────
        result = await db.execute(select(FAQ))
        if not result.scalars().first():
            for f in DEFAULT_FAQS:
                db.add(FAQ(**f))

        # ── Product Categories ───────────────────────────────────────────────
        result = await db.execute(select(ProductCategory))
        if not result.scalars().first():
            for c in DEFAULT_PRODUCT_CATEGORIES:
                db.add(ProductCategory(**c))

        # ── Blog Categories ──────────────────────────────────────────────────
        result = await db.execute(select(BlogCategory))
        if not result.scalars().first():
            for c in DEFAULT_BLOG_CATEGORIES:
                db.add(BlogCategory(**c))

        await db.commit()
        logger.info("Database seeding complete.")


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Al Rehman Solar API...")
    await seed_database()
    yield
    logger.info("Shutting down...")


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Al Rehman Solar API",
    description="Backend API for Al Rehman Solar System & UPS",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

origins = [
    settings.FRONTEND_URL,
    settings.PRODUCTION_URL,
    "https://www.alrehmansolars.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(leads.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(blog.router, prefix=API_PREFIX)
app.include_router(contact.router, prefix=API_PREFIX)
app.include_router(calculator.router, prefix=API_PREFIX)
app.include_router(faqs.router, prefix=API_PREFIX)
app.include_router(testimonials.router, prefix=API_PREFIX)
app.include_router(settings_router.router, prefix=API_PREFIX)
app.include_router(quotes.router, prefix=API_PREFIX)
app.include_router(activity.router, prefix=API_PREFIX)
app.include_router(upload.router, prefix=API_PREFIX)

# ─── Static file serving for uploads ──────────────────────────────────────────
upload_dir = Path(__file__).resolve().parents[1] / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


@app.get("/")
async def root():
    return {"message": "Al Rehman Solar API is running.", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
