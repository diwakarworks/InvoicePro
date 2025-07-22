"use client";
import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f9fafb] via-white to-[#f0f0f0] flex flex-col justify-between relative overflow-hidden">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-16 py-6 border-b border-gray-100 z-10 relative">
        <div className="text-2xl font-extrabold text-gray-900 tracking-tight">InvoicePro</div>
        <div className="flex items-center space-x-6">
          <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-black transition">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-6 md:px-20 py-24 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-4xl">
          Simple, Smart & Powerful <br />
          Invoicing for Your Business
        </h1>
        <p className="text-lg text-gray-600 mt-6 max-w-2xl">
          Create and send professional invoices in seconds. Track payments, manage clients, and grow your revenue—all from one powerful dashboard.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-black to-gray-900 text-white px-7 py-3 rounded-xl text-sm font-semibold shadow-md hover:opacity-90 transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* Animated Background Blur */}
      <div className="absolute top-[-6rem] right-[-6rem] w-[30rem] h-[30rem] bg-gradient-to-tr from-blue-200 via-purple-300 to-pink-300 opacity-30 rounded-full blur-3xl z-0 animate-pulse-slow" />
      <div className="absolute bottom-[-8rem] left-[-8rem] w-[40rem] h-[40rem] bg-gradient-to-tr from-yellow-100 via-orange-200 to-red-300 opacity-20 rounded-full blur-3xl z-0 animate-pulse-slower" />

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 z-10 relative">
        © {new Date().getFullYear()} InvoicePro. All rights reserved.
      </footer>
    </section>
  );
}
