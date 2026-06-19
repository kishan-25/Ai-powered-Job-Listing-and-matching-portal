"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserApplications } from "@/services/applicationService";
import RoleGuard from "@/components/RoleGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, ExternalLink, FileText } from "lucide-react";

function ago(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_STYLE = {
  pending:            { bg: "rgba(245,158,11,0.1)",  color: "#FBB040", border: "rgba(245,158,11,0.25)", label: "Applied" },
  shortlisted:        { bg: "rgba(16,185,129,0.1)",  color: "#34D399", border: "rgba(16,185,129,0.25)", label: "Shortlisted" },
  interview_scheduled:{ bg: "rgba(13,81,255,0.1)",   color: "#6B9FFF", border: "rgba(13,81,255,0.25)",  label: "Interview" },
  rejected:           { bg: "rgba(239,68,68,0.1)",   color: "#F87171", border: "rgba(239,68,68,0.25)",  label: "Rejected" },
};

export default function ApplicationsPage() {
  const { user }     = useSelector((s) => s.auth);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserApplications()
      .then((d) => setApps(Array.isArray(d?.applications ?? d) ? (d?.applications ?? d) : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RoleGuard allowedRoles={["job_seeker"]}>
      <div className="min-h-screen bg-background flex">
        <Sidebar />

        <div className="ml-60 flex-1 min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-8 h-14 border-b"
            style={{ background: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">Applications</h1>
              <p className="text-[0.7rem] mt-0.5" style={{ color: "var(--foreground-dim)" }}>
                Jobs you&apos;ve applied to
              </p>
            </div>
            <Link href="/dashboard" className="text-xs transition-colors"
              style={{ color: "var(--foreground-dim)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; }}>
              ← Back to jobs
            </Link>
          </div>

          <div className="max-w-2xl mx-auto px-8 py-8">
            {/* Stats */}
            {!loading && apps.length > 0 && (
              <div className="flex gap-6 mb-6">
                <div>
                  <p className="text-2xl font-bold text-foreground">{apps.length}</p>
                  <p className="text-xs" style={{ color: "var(--foreground-dim)" }}>total applied</p>
                </div>
                {Object.entries(STATUS_STYLE).map(([key, s]) => {
                  const count = apps.filter((a) => (a.status || "pending") === key).length;
                  if (!count) return null;
                  return (
                    <div key={key}>
                      <p className="text-2xl font-bold" style={{ color: s.color }}>{count}</p>
                      <p className="text-xs" style={{ color: "var(--foreground-dim)" }}>{s.label.toLowerCase()}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Header */}
              {!loading && apps.length > 0 && (
                <div className="flex items-center justify-between px-5 py-2.5 text-[0.67rem] font-semibold tracking-wider border-b"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", color: "var(--foreground-dim)" }}>
                  <span>JOB</span>
                  <span>STATUS · DATE</span>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="spinner h-7 w-7" />
                </div>
              ) : apps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
                  <FileText className="h-10 w-10 opacity-30" style={{ color: "var(--foreground-dim)" }} />
                  <p className="font-semibold text-sm text-foreground">No applications yet</p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    Start applying to jobs to track them here
                  </p>
                  <Link href="/dashboard"
                    className="mt-2 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                    style={{ background: "var(--primary)", color: "#fff" }}>
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                apps.map((app, i) => {
                  const s = STATUS_STYLE[app.status || "pending"] || STATUS_STYLE.pending;
                  return (
                    <div key={app._id || i}
                      className="flex items-center gap-4 px-5 py-4 border-b transition-colors"
                      style={{ borderColor: "rgba(255,255,255,0.055)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.028)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>

                      {/* Icon */}
                      <div className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Briefcase className="h-4 w-4" style={{ color: "var(--foreground-dim)" }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{app.title || "Untitled"}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>
                          {app.company && <span className="font-medium">{app.company}</span>}
                          {app.company && app.location && <span style={{ color: "var(--foreground-dim)" }}>·</span>}
                          {app.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5" />{app.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[0.67rem] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {s.label}
                        </span>
                        <span className="flex items-center gap-1 text-[0.67rem]" style={{ color: "var(--foreground-dim)" }}>
                          <Calendar className="h-2.5 w-2.5" />
                          {ago(app.applicationDate)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
