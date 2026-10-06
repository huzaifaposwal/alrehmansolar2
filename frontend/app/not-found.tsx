"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sun, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-hero bg-dots flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
        <div className="w-20 h-20 bg-green-600/20 border-2 border-green-600/40 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Sun className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-8xl font-black text-white/10 font-heading mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4 font-heading">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
          <Link href="/contact" className="btn-outline-white">
            Contact Us
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
