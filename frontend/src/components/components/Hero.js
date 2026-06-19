"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MapPin, Target, Briefcase, FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "@/services/authService";
import Link from "next/link";

/* Rotating role in the trending line — subtle, not part of main heading */
const ROLES = ["Software Engineer", "Full Stack Dev", "Frontend Engineer", "Data Scientist", "Backend Engineer"];

export default function Hero() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const [userData, setUserData]   = useState(null);
  const [roleIdx, setRoleIdx]     = useState(0);
  const [keyword, setKeyword]     = useState("");
  const [location, setLocation]   = useState("");

  useEffect(() => { setUserData(user || getUserFromLocalStorage()); }, [user]);
  useEffect(() => {
    const t = setInterval(() => setRoleIdx((i) => (i + 1) % ROLES.length), 2500);
    return () => clearInterval(t);
  }, []);

  const authed   = !!(userData || isAuthenticated);
  const dashHref = userData?.userRole === "admin" ? "/admin"
    : userData?.userRole === "recruiter"         ? "/recruiter"
    : "/dashboard";

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (keyword) p.set("search", keyword);
    if (location) p.set("location", location);
    window.location.href = authed ? `/dashboard?${p}` : `/register`;
  };

  return (
    <section className="pt-14 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Main heading — startup.jobs exact pattern ── */}
        <h1
          className="text-[2.6rem] sm:text-[3rem] leading-tight mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          <span className="font-bold" style={{ color: "var(--foreground)" }}>TalentAlign</span>
          {" "}
          <span className="font-normal" style={{ color: "var(--foreground-muted)" }}>
            Find your next role at the fastest growing technology startups.
          </span>
        </h1>

        {/* ── Trending (rotating) — subtle secondary line ── */}
        <div
          className="flex items-center gap-2 text-sm mb-8"
          style={{ color: "var(--foreground-muted)" }}
        >
          <span>Trending:</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={ROLES[roleIdx]}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {ROLES[roleIdx]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ── Search bar — two inputs + button, startup.jobs layout ── */}
        <form onSubmit={handleSearch} className="mb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: "var(--foreground-dim)" }}
              />
              <input
                type="text"
                placeholder="Keywords..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(13,81,255,0.5)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>
            <div className="relative sm:w-52">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: "var(--foreground-dim)" }}
              />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(13,81,255,0.5)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold rounded-lg transition-colors"
              style={{ background: "var(--primary)", color: "#fff" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary)"; }}
            >
              Search Jobs
            </button>
          </div>
        </form>

        {/* ── Quick filter pills ── */}
        <div className="flex flex-wrap gap-2 mb-16">
          {["Remote", "Internship", "Full-time", "Startup", "AI / ML"].map((tag) => (
            <Link
              key={tag}
              href={authed ? `/dashboard?search=${encodeURIComponent(tag)}` : "/register"}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--foreground-muted)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--foreground-muted)"; }}
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* ── Feature cards (spotlight style) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Target,   title: "AI Skill Matching",  desc: "See your match % for every job based on your skills." },
            { icon: Briefcase,title: "Multi-source Jobs",  desc: "Telegram, HireJobs, TimesJobs — one clean feed." },
            { icon: FileText, title: "AI Cover Letters",   desc: "One click. Tailored to the role and company." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-xl transition-colors"
              style={{
                background: "var(--surface-2)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center mb-2.5"
                style={{ background: "rgba(13,81,255,0.14)" }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--foreground)" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Auth CTA ── */}
        <div className="mt-10 flex items-center gap-4">
          {authed ? (
            <Link
              href={dashHref}
              className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                Get started — it&apos;s free
              </Link>
              <Link
                href="/login"
                className="text-sm transition-colors"
                style={{ color: "var(--foreground-muted)" }}
              >
                Sign in →
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
