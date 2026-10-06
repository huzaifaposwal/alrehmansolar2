"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Clock, Calendar, Search, ChevronRight, Tag } from "lucide-react";
import api from "@/lib/api";
import type { BlogPost, BlogCategory, PaginatedResponse } from "@/types";
import { formatDate, truncate, estimateReadTime } from "@/lib/utils";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blog-data";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(() => BLOG_POSTS.slice(0, 9));
  const [categories, setCategories] = useState<BlogCategory[]>(() => BLOG_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(() => Math.ceil(BLOG_POSTS.length / 9));

  useEffect(() => {
    api.getBlogCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { page, page_size: 9 };
    if (search) params.search = search;
    if (activeCategory) params.category = activeCategory;
    api.getBlogPosts(params)
      .then((data: PaginatedResponse<BlogPost>) => {
        setPosts(data.items);
        setTotalPages(data.total_pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, activeCategory, page]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots">
        <div className="container-main text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
              <BookOpen className="w-4 h-4" /> Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
              Solar Energy Blog
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto">
              Solar tips, news, guides and insights for homes and businesses in Pakistan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section bg-gray-50">
        <div className="container-main">
          {/* Search + Categories */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search articles..."
                className="form-input pl-10 py-2.5"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setActiveCategory(""); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!activeCategory ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:border-green-500"}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.slug ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:border-green-500"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <div key={i} className="h-80 rounded-2xl skeleton" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No articles yet</p>
              <p className="text-sm mt-1">Blog posts will be published soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="card group overflow-hidden"
                >
                  {/* Featured image */}
                  <div className="h-48 bg-gradient-to-br from-green-800 to-navy-900 overflow-hidden relative">
                    {post.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/20" />
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-3 left-3 badge bg-green-600 text-white flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {post.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      {post.published_at && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.published_at)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {post.read_time_minutes || estimateReadTime(post.content || post.excerpt || "")} min read
                      </span>
                    </div>

                    <h2 className="font-bold text-navy-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors font-heading leading-snug">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-1 text-green-600 text-sm font-medium hover:gap-2 transition-all"
                    >
                      Read More <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm disabled:opacity-40">Previous</button>
              <span className="px-5 py-2.5 text-sm">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
