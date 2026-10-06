"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FolderOpen, MapPin, Zap, Calendar, ChevronRight, Filter } from "lucide-react";
import api from "@/lib/api";
import type { Project, PaginatedResponse } from "@/types";
import { formatDate } from "@/lib/utils";

const PROJECT_TYPES = ["", "residential", "commercial", "industrial", "agricultural"];
const TYPE_LABELS: Record<string, string> = {
  "": "All", residential: "Residential", commercial: "Commercial",
  industrial: "Industrial", agricultural: "Agricultural",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { page, page_size: 9 };
    if (filterType) params.project_type = filterType;
    api.getProjects(params)
      .then((data: PaginatedResponse<Project>) => {
        setProjects(data.items);
        setTotalPages(data.total_pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterType, page]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots">
        <div className="container-main text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
              <FolderOpen className="w-4 h-4" /> Our Work
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
              Our Solar Project Portfolio
            </h1>
            <p className="text-gray-300 max-w-xl mx-auto">
              Browse our completed solar installations across Lahore and surrounding areas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <section className="section bg-gray-50">
        <div className="container-main">
          {/* Filter */}
          <div className="flex gap-2 flex-wrap mb-8">
            {PROJECT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setPage(1); }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${filterType === type ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:border-green-500"}`}
              >
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <div key={i} className="h-72 rounded-2xl skeleton" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No projects yet</p>
              <p className="text-sm mt-1">Project portfolio will be updated soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => {
                const primaryImage = project.images?.find(img => img.is_primary) || project.images?.[0];
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="card group overflow-hidden"
                  >
                    {/* Image */}
                    <div className="h-52 bg-gradient-to-br from-navy-800 to-navy-900 relative overflow-hidden">
                      {primaryImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={primaryImage.url}
                          alt={primaryImage.alt || project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen className="w-16 h-16 text-white/20" />
                        </div>
                      )}
                      {project.capacity_kw && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-xl">
                          <Zap className="w-3.5 h-3.5" />
                          {project.capacity_kw} kW
                        </div>
                      )}
                      {project.is_featured && (
                        <div className="absolute top-3 left-3 badge bg-solar-400 text-navy-900">Featured</div>
                      )}
                    </div>
                    <div className="p-5">
                      {project.project_type && (
                        <span className="badge-green mb-2 capitalize">{project.project_type}</span>
                      )}
                      <h3 className="font-bold text-navy-900 mb-2 font-heading group-hover:text-green-700 transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                        {project.location && (
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
                        )}
                        {project.completion_date && (
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(project.completion_date)}</span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
                      )}
                      <Link
                        href={`/projects/${project.slug}`}
                        className="flex items-center gap-1 text-green-600 text-sm font-medium hover:gap-2 transition-all"
                      >
                        View Project <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
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

      {/* CTA */}
      <section className="py-16 bg-navy-900">
        <div className="container-main text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-heading">Want a Similar Installation?</h2>
          <p className="text-gray-400 mb-8">Contact us for a free site assessment and custom solar quote.</p>
          <Link href="/quote" className="btn-primary">Get Free Quote</Link>
        </div>
      </section>
    </>
  );
}
