"""Initial complete database schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-22 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(100), nullable=True),
        sa.Column('role', sa.String(50), nullable=False, server_default='admin'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Leads table
    op.create_table(
        'leads',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('full_name', sa.String(150), nullable=False),
        sa.Column('phone', sa.String(30), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('property_type', sa.String(50), nullable=True),
        sa.Column('monthly_bill', sa.Float(), nullable=True),
        sa.Column('monthly_units', sa.Float(), nullable=True),
        sa.Column('preferred_system', sa.String(50), nullable=True),
        sa.Column('roof_size', sa.Float(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='new'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('source', sa.String(50), server_default='website'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Contact Messages table
    op.create_table(
        'contact_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('phone', sa.String(30), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('subject', sa.String(200), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Quote Requests table
    op.create_table(
        'quote_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('full_name', sa.String(150), nullable=False),
        sa.Column('phone', sa.String(30), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('property_type', sa.String(50), nullable=True),
        sa.Column('monthly_bill', sa.Float(), nullable=True),
        sa.Column('monthly_units', sa.Float(), nullable=True),
        sa.Column('preferred_system', sa.String(50), nullable=True),
        sa.Column('roof_size', sa.Float(), nullable=True),
        sa.Column('recommended_system', sa.String(100), nullable=True),
        sa.Column('estimated_price', sa.Float(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('source', sa.String(50), server_default='website'),
        sa.Column('status', sa.String(50), nullable=False, server_default='new'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Product Categories
    op.create_table(
        'product_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('slug', sa.String(100), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Products
    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('slug', sa.String(200), nullable=False, unique=True),
        sa.Column('brand', sa.String(100), nullable=True),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('product_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('specifications', sa.JSON(), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('is_available', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('images', sa.JSON(), nullable=True),
        sa.Column('seo_title', sa.String(200), nullable=True),
        sa.Column('seo_description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Projects
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('slug', sa.String(200), nullable=False, unique=True),
        sa.Column('location', sa.String(100), nullable=True),
        sa.Column('capacity_kw', sa.Float(), nullable=True),
        sa.Column('project_type', sa.String(50), nullable=True),
        sa.Column('system_type', sa.String(50), nullable=True),
        sa.Column('completion_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('components', sa.JSON(), nullable=True),
        sa.Column('results', sa.Text(), nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('seo_title', sa.String(200), nullable=True),
        sa.Column('seo_description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Project Images
    op.create_table(
        'project_images',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('caption', sa.String(200), nullable=True),
        sa.Column('is_primary', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('display_order', sa.Integer(), server_default='0'),
    )

    # Blog Categories
    op.create_table(
        'blog_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('slug', sa.String(100), nullable=False, unique=True),
        sa.Column('description', sa.Text(), nullable=True),
    )

    # Blog Posts
    op.create_table(
        'blog_posts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False, unique=True),
        sa.Column('excerpt', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('author', sa.String(100), server_default='Al Rehman Solar Team'),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('blog_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('featured_image', sa.String(500), nullable=True),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('read_time_minutes', sa.Integer(), nullable=True),
        sa.Column('seo_title', sa.String(200), nullable=True),
        sa.Column('seo_description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Testimonials
    op.create_table(
        'testimonials',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('client_name', sa.String(100), nullable=False),
        sa.Column('client_role', sa.String(100), nullable=True),
        sa.Column('location', sa.String(100), nullable=True),
        sa.Column('system_info', sa.String(100), nullable=True),
        sa.Column('rating', sa.Integer(), server_default='5'),
        sa.Column('review', sa.Text(), nullable=False),
        sa.Column('client_image', sa.String(500), nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default=sa.text('false')),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # FAQs
    op.create_table(
        'faqs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('question', sa.String(300), nullable=False),
        sa.Column('answer', sa.Text(), nullable=False),
        sa.Column('category', sa.String(100), nullable=True),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('is_published', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Site Settings
    op.create_table(
        'site_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('key', sa.String(100), nullable=False, unique=True),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('value_json', sa.JSON(), nullable=True),
        sa.Column('label', sa.String(150), nullable=True),
        sa.Column('group', sa.String(50), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # SEO Settings
    op.create_table(
        'seo_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('page_path', sa.String(255), nullable=False, unique=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('canonical_url', sa.String(500), nullable=True),
        sa.Column('og_title', sa.String(200), nullable=True),
        sa.Column('og_description', sa.Text(), nullable=True),
        sa.Column('og_image', sa.String(500), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Activity Logs
    op.create_table(
        'activity_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('user_email', sa.String(255), nullable=True),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('entity', sa.String(50), nullable=False),
        sa.Column('entity_id', sa.String(100), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )


def downgrade() -> None:
    op.drop_table('activity_logs')
    op.drop_table('seo_settings')
    op.drop_table('site_settings')
    op.drop_table('faqs')
    op.drop_table('testimonials')
    op.drop_table('blog_posts')
    op.drop_table('blog_categories')
    op.drop_table('project_images')
    op.drop_table('projects')
    op.drop_table('products')
    op.drop_table('product_categories')
    op.drop_table('quote_requests')
    op.drop_table('contact_messages')
    op.drop_table('leads')
    op.drop_table('users')
