import type { Metadata } from "next";
import { getBlogPostBySlug, BLOG_POSTS } from "@/lib/blog-data";
import BlogPostClient from "./BlogPostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | Al Rehman Solar System & UPS",
    };
  }

  const title = `${post.seo_title || post.title} | Al Rehman Solar System & UPS`;
  const description = post.seo_description || post.excerpt || undefined;

  return {
    title,
    description,
    keywords: post.tags || undefined,
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at || undefined,
      images: post.featured_image
        ? [
            {
              url: post.featured_image,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  return <BlogPostClient initialPost={post} slug={slug} />;
}
