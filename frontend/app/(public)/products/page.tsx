"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Package, Search, Filter, SlidersHorizontal, ChevronRight, Star } from "lucide-react";
import api from "@/lib/api";
import type { Product, ProductCategory, PaginatedResponse } from "@/types";
import { formatPKR } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.getProductCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { page, page_size: 12 };
    if (search) params.search = search;
    if (activeCategory) params.category = activeCategory;
    api.getProducts(params)
      .then((data: PaginatedResponse<Product>) => {
        setProducts(data.items);
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
              <Package className="w-4 h-4" /> Product Catalog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
              Solar Products & Equipment
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto">
              Quality solar panels, inverters, batteries and UPS systems from trusted brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Catalog */}
      <section className="section bg-gray-50">
        <div className="container-main">
          {/* Filters */}
          <div className="card p-4 mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search products..."
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

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => <div key={i} className="h-64 rounded-2xl skeleton" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Products will be added by the admin soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card group"
                >
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="w-16 h-16 text-gray-300" />
                    )}
                    {product.is_featured && (
                      <span className="absolute top-3 left-3 badge bg-solar-100 text-solar-700 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {product.category && (
                      <span className="badge-green mb-2">{product.category.name}</span>
                    )}
                    <h3 className="font-bold text-navy-900 mb-1 group-hover:text-green-700 transition-colors font-heading line-clamp-2">
                      {product.name}
                    </h3>
                    {product.brand && <p className="text-xs text-gray-400 mb-2">{product.brand}</p>}
                    {product.price ? (
                      <p className="text-green-600 font-bold">{formatPKR(product.price)}</p>
                    ) : (
                      <p className="text-gray-400 text-sm">Contact for pricing</p>
                    )}
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex items-center gap-1 text-green-600 text-sm font-medium mt-3 hover:gap-2 transition-all"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm disabled:opacity-40">Previous</button>
              <span className="px-5 py-2.5 text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600">
        <div className="container-main text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Need Help Choosing?</h2>
          <p className="text-green-100 mb-8">Our team will help you select the right products for your solar system.</p>
          <Link href="/quote" className="btn-white">Get Free Consultation</Link>
        </div>
      </section>
    </>
  );
}
