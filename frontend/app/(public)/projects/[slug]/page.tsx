"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FolderOpen, ArrowLeft, MapPin, Calendar, Zap } from "lucide-react";
import api from "@/lib/api";
import type { Project } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.getProject(slug).then(setProject).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen pt-32 flex items-center justify-center"><div className="w-10 h-10 border-4 border-green-600/30 border-t-green-600 rounded-full animate-spin" /></div>;
  if (!project) return <div className="min-h-screen pt-32 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-navy-900 mb-4 font-heading">Project Not Found</h1><Link href="/projects" className="btn-primary">Back to Portfolio</Link></div></div>;

  const primaryImage = project.images?.find(img => img.is_primary) || project.images?.[0];

  return (
    <>
      <section className="relative bg-navy-900 pt-32 pb-20">
        <div className="container-main">
          <Link href="/projects" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {project.project_type && <span className="badge-green mb-4 capitalize inline-block">{project.project_type}</span>}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading leading-tight">{project.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
                {project.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-green-500" />{project.location}</span>}
                {project.completion_date && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-green-500" />{formatDate(project.completion_date)}</span>}
                {project.capacity_kw && <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-green-500" />{project.capacity_kw} kW Capacity</span>}
              </div>
              <div className="flex gap-4">
                <Link href="/quote" className="btn-primary">Request Similar Project</Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={primaryImage.url} alt={primaryImage.alt || project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-navy-800 flex items-center justify-center"><FolderOpen className="w-16 h-16 text-white/20" /></div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-main">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-navy-900 mb-4 font-heading">Project Overview</h2>
              {project.description ? (
                <div className="prose-solar" dangerouslySetInnerHTML={{ __html: project.description }} />
              ) : (
                <p className="text-gray-600">No description available for this project.</p>
              )}

              {project.images && project.images.length > 1 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-navy-900 mb-4 font-heading">Gallery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {project.images.filter(img => !img.is_primary).map((img, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.alt || `Gallery image ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="card p-6 bg-gray-50 border-none sticky top-24">
                <h3 className="font-bold text-navy-900 mb-4 font-heading">Project Highlights</h3>
                <ul className="space-y-4">
                  {project.capacity_kw && (
                    <li className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">System Capacity</p>
                        <p className="font-semibold text-navy-900">{project.capacity_kw} kW</p>
                      </div>
                    </li>
                  )}
                  {project.location && (
                    <li className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="font-semibold text-navy-900">{project.location}</p>
                      </div>
                    </li>
                  )}
                  {project.completion_date && (
                    <li className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><Calendar className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Completed</p>
                        <p className="font-semibold text-navy-900">{formatDate(project.completion_date)}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
