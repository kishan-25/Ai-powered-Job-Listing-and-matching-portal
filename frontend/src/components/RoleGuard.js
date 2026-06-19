"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

/* Shared loading shell — same markup on server and client so hydration never
   mismatches. We only swap to actual content after the component has mounted
   AND Redux auth has been hydrated from localStorage.                         */
function Shell({ message = "Loading…" }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner h-8 w-8" />
        <p className="text-xs" style={{ color: "var(--foreground-dim)" }}>{message}</p>
      </div>
    </div>
  );
}

export default function RoleGuard({ children, allowedRoles = [], redirectTo = "/login" }) {
  const router  = useRouter();
  const { user, isAuthenticated, hydrated } = useSelector((s) => s.auth);

  // `mounted` starts false on both server and client — guarantees the first
  // paint is identical, eliminating the hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // After mount, handle redirects
  useEffect(() => {
    if (!mounted || !hydrated) return;

    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }
    if (user.accountStatus === "suspended") {
      router.push("/suspended");
      return;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.userRole)) {
      const dest = user.userRole === "admin" ? "/admin"
        : user.userRole === "recruiter" ? "/recruiter"
        : "/dashboard";
      router.push(dest);
    }
  }, [mounted, hydrated, isAuthenticated, user, allowedRoles, router, redirectTo]);

  // ── Before mount: always show the same shell (no mismatch) ──────────────
  if (!mounted || !hydrated) return <Shell />;

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated || !user) return <Shell message="Redirecting to login…" />;

  // ── Suspended ────────────────────────────────────────────────────────────
  if (user.accountStatus === "suspended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div
          className="max-w-sm w-full rounded-2xl p-8 text-center"
          style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            <svg className="w-6 h-6" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Account Suspended</h2>
          <p className="text-sm mb-5" style={{ color: "var(--foreground-muted)" }}>
            {user.suspensionReason || "Your account has been suspended. Please contact support."}
          </p>
          <button onClick={() => router.push("/#contact")} className="btn-primary w-full">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // ── Wrong role ───────────────────────────────────────────────────────────
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userRole)) {
    return <Shell message="Redirecting…" />;
  }

  // ── Authorised ───────────────────────────────────────────────────────────
  return <>{children}</>;
}
