"use client";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs leading-none">T</span>
            </div>
            <span className="font-bold text-foreground text-sm">TalentAlign</span>
          </div>
          <p className="text-foreground-muted text-xs max-w-xs leading-relaxed">
            AI-powered job matching. Centralising opportunities from Telegram, HireJobs, and TimesJobs.
          </p>
          <a href="mailto:bkbajpay0905@gmail.com"
            className="inline-flex items-center gap-1.5 text-foreground-dim hover:text-foreground text-xs mt-3 transition-colors">
            <Mail className="h-3.5 w-3.5" />
            bkbajpay0905@gmail.com
          </a>
        </div>

        {/* Links */}
        <div className="flex gap-12">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Platform</p>
            {[
              { label: "Browse Jobs", href: "/dashboard" },
              { label: "How It Works", href: "/#how-it-works" },
              { label: "Contact", href: "/#contact" },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="block text-xs text-foreground-muted hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Account</p>
            {[
              { label: "Sign Up", href: "/register" },
              { label: "Login", href: "/login" },
              { label: "Dashboard", href: "/dashboard" },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="block text-xs text-foreground-muted hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 pt-6 border-t border-border">
        <p className="text-foreground-dim text-xs">© {year} TalentAlign. All rights reserved.</p>
      </div>
    </footer>
  );
}
