"use client";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage, removeUserFromLocalStorage } from "@/services/authService";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/redux/slices/authSlice";
import toast from "react-hot-toast";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

// Startup.jobs-style navbar:
// - Transparent/dark bg
// - Logo left, nav links centre, single CTA right
// - No theme toggle (app is dark-only by design)

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);

  useEffect(() => {
    setUserData(user || getUserFromLocalStorage());
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-browse-menu]")) setBrowseOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    removeUserFromLocalStorage();
    dispatch(logout());
    setMobileOpen(false);
    toast.success("Logged out successfully", { ...TOAST, duration: 2000 });
    setTimeout(() => router.push("/"), 800);
  };

  const dashboardHref =
    userData?.userRole === "admin"    ? "/admin" :
    userData?.userRole === "recruiter"? "/recruiter" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)]"
      style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-7 w-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-white font-bold text-sm leading-none">T</span>
            </div>
            <span className="font-bold text-[var(--foreground)] text-base tracking-tight">
              TalentAlign
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {/* Browse Jobs dropdown */}
            <div className="relative" data-browse-menu>
              <button
                onClick={() => setBrowseOpen(!browseOpen)}
                className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Browse Jobs
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${browseOpen ? "rotate-180" : ""}`} />
              </button>

              {browseOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 rounded-lg border border-[var(--border)] py-1 z-50"
                  style={{ background: "var(--surface-2)" }}>
                  {[
                    { label: "All Jobs", href: "/dashboard" },
                    { label: "Remote", href: "/dashboard?workMode=remote" },
                    { label: "Internships", href: "/dashboard?type=internship" },
                  ].map(({ label, href }) => (
                    <Link key={href} href={href}
                      onClick={() => setBrowseOpen(false)}
                      className="block px-4 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/#how-it-works"
              className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
              How It Works
            </Link>
            <Link href="/#contact"
              className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
              Contact
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {userData || isAuthenticated ? (
              <>
                <Link href={dashboardHref}
                  className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                  Login
                </Link>
                <Link href="/register"
                  className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden ml-auto p-1.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] py-3 px-4 space-y-1"
          style={{ background: "var(--background)" }}>
          {[
            { label: "Browse Jobs", href: "/dashboard" },
            { label: "How It Works", href: "/#how-it-works" },
            { label: "Contact", href: "/#contact" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 px-3 rounded-md text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
              {label}
            </Link>
          ))}

          <div className="pt-2 border-t border-[var(--border)]">
            {userData || isAuthenticated ? (
              <>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)}
                  className="block py-2 px-3 rounded-md text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full py-2 px-3 rounded-md text-sm text-[var(--error)] hover:bg-[var(--surface)] transition-colors">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="block py-2 px-3 rounded-md text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface)] transition-colors">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="block mt-1 py-2 px-3 rounded-md text-sm text-center btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
