"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, Tag } from "lucide-react";
import api from "@/lib/api";
import type { BlogPost } from "@/types";
import { formatDate, estimateReadTime } from "@/lib/utils";

interface BlogPostClientProps {
  initialPost: BlogPost | null;
  slug: string;
}

export default function BlogPostClient({ initialPost, slug }: BlogPostClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);

  useEffect(() => {
    if (!initialPost && slug) {
      api.getBlogPost(slug)
        .then(setPost)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialPost, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="container-main max-w-3xl space-y-4">
          <div className="h-8 w-2/3 rounded-xl skeleton" />
          <div className="h-4 w-1/3 rounded-xl skeleton" />
          <div className="h-64 rounded-2xl skeleton" />
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-4 rounded-lg skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4 font-heading">Post Not Found</h1>
          <Link href="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-16 bg-dots">
        <div className="container-main max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            {post.category && (
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 badge bg-green-600 text-white">
                  <Tag className="w-3 h-3" />{post.category.name}
                </span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {post.author && <span>By {post.author}</span>}
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />{formatDate(post.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.read_time_minutes || estimateReadTime(post.content || "")} min read
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="section bg-white">
        <div className="container-main max-w-3xl">
          {post.featured_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-2xl shadow-lg mb-10 aspect-video object-cover"
            />
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose-solar"
            dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || "" }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
              {post.tags.map((tag) => (
                <span key={tag} className="badge bg-gray-100 text-gray-600">#{tag}</span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 p-6 bg-green-50 rounded-2xl border border-green-100">
            <h3 className="font-bold text-navy-900 mb-2 font-heading">Interested in Solar for Your Home?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get a free quote from our engineering team or calculate your potential savings today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/quote" className="btn-primary text-sm py-2.5 px-5">Get Free Quote</Link>
              <Link href="/calculator" className="btn-secondary text-sm py-2.5 px-5">Solar Calculator</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
