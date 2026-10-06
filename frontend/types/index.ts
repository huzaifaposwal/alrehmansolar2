// Global TypeScript types for Al Rehman Solar

export interface SiteSetting {
  key: string;
  value: string | null;
  value_json: Record<string, any> | null;
  label: string | null;
  group: string | null;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  model: string | null;
  category_id: string | null;
  category: ProductCategory | null;
  description: string | null;
  specifications: Record<string, string> | null;
  images: string[] | null;
  price: number | null;
  is_available: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  capacity_kw: number | null;
  project_type: string | null;
  system_type: string | null;
  completion_date: string | null;
  description: string | null;
  components: string[] | null;
  results: string | null;
  is_published?: boolean;
  is_featured: boolean;
  images: ProjectImage[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author: string | null;
  category_id: string | null;
  category: BlogCategory | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  read_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  review: string;
  review_date: string | null;
  image_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  property_type: string | null;
  monthly_bill: number | null;
  monthly_units: number | null;
  preferred_system: string | null;
  roof_size: number | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "qualified"
  | "quoted"
  | "proposal_sent"
  | "converted"
  | "won"
  | "closed"
  | "lost";

export type QuoteStatus =
  | "new"
  | "reviewing"
  | "contacted"
  | "quote_sent"
  | "converted"
  | "closed";

export interface QuoteRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  property_type: string | null;
  monthly_bill: number | null;
  monthly_units: number | null;
  preferred_system: string | null;
  roof_size: number | null;
  recommended_system: string | null;
  estimated_price: number | null;
  message: string | null;
  notes: string | null;
  status: QuoteStatus;
  source: string;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

export interface CalculatorInput {
  monthly_bill_pkr?: number;
  monthly_units_kwh?: number;
  city?: string;
  property_type?: string;
  system_type?: string;
  roof_size_sqft?: number;
}

export interface CalculatorResult {
  recommended_capacity_kw: number;
  estimated_monthly_generation_kwh: number;
  estimated_monthly_savings_pkr: number;
  estimated_annual_savings_pkr: number;
  estimated_payback_years: number;
  estimated_co2_reduction_kg_year: number;
  system_type: string;
  disclaimer: string;
  assumptions: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardStats {
  new_leads: number;
  total_leads: number;
  contacted_leads: number;
  converted_leads: number;
  quote_requests: number;
  unread_messages: number;
  total_products: number;
  total_projects: number;
  published_blog_posts: number;
  published_testimonials: number;
  published_faqs: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "admin" | "editor";
  is_active: boolean;
  created_at: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  original_name: string;
  size: number;
  content_type: string;
}
