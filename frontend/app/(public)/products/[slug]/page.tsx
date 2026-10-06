"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Package, ArrowLeft, CheckCircle2, Tag } from "lucide-react";
import api from "@/lib/api";
import type { Product } from "@/types";
import { formatPKR } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.getProduct(slug).then(setProduct).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen pt-32 flex items-center justify-center"><div className="w-10 h-10 border-4 border-green-600/30 border-t-green-600 rounded-full animate-spin" /></div>;
  if (!product) return <div className="min-h-screen pt-32 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-navy-900 mb-4 font-heading">Product Not Found</h1><Link href="/products" className="btn-primary">Back to Products</Link></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      <div className="container-main py-10 max-w-5xl">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="card overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center">
              {product.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-8" />
              ) : (
                <Package className="w-24 h-24 text-gray-300" />
              )}
            </div>
          </div>
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {product.category && <span className="badge-green">{product.category.name}</span>}
            <h1 className="text-3xl font-bold text-navy-900 font-heading">{product.name}</h1>
            {product.brand && <p className="text-gray-500">Brand: <span className="font-medium text-navy-900">{product.brand}</span></p>}
            {product.model && <p className="text-gray-500">Model: <span className="font-medium text-navy-900">{product.model}</span></p>}
            {product.price ? (
              <div className="text-3xl font-bold text-green-600">{formatPKR(product.price)}</div>
            ) : (
              <div className="text-lg font-medium text-gray-500">Contact for pricing</div>
            )}
            {product.description && <p className="text-gray-600 leading-relaxed">{product.description}</p>}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h2 className="font-bold text-navy-900 mb-3 font-heading">Specifications</h2>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-navy-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/quote" className="btn-primary">Get a Quote</Link>
              <Link href="/contact" className="btn-secondary">Ask a Question</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
