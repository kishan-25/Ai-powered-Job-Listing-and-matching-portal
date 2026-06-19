"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import { getRecruiterStats, getRecruiterJobs, closeJob, deleteJob } from "@/services/recruiterService";
import toast, { Toaster } from "react-hot-toast";
import { Briefcase, Users, FileText, PlusCircle, Edit, Trash2, XCircle, ChevronRight } from "lucide-react";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

const STATUS_COLORS = {
  active: "text-match-high bg-success/10",
  draft:  "text-warning bg-warning/10",
  closed: "text-foreground-dim bg-surface-2",
};

export default function RecruiterDashboard() {
  const router = useRouter();
  const [stats, setStats]         = useState(null);
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState("all");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, jRes] = await Promise.all([
        getRecruiterStats(),
        getRecruiterJobs({ page, limit: 10, status: statusFilter !== "all" ? statusFilter : undefined }),
      ]);
      if (sRes.success) setStats(sRes.stats);
      if (jRes.success) {
        setJobs(jRes.jobs);
        setTotalPages(jRes.pagination?.pages || 1);
      }
    } catch (e) {
      toast.error(e.message || "Failed to load data", TOAST);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleClose = async (id) => {
    if (!confirm("Close this job?")) return;
    try {
      await closeJob(id);
      toast.success("Job closed", TOAST);
      load();
    } catch (e) {
      toast.error(e.message || "Failed", TOAST);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    try {
      await deleteJob(id);
      toast.success("Job deleted", TOAST);
      load();
    } catch (e) {
      toast.error(e.message || "Failed", TOAST);
    }
  };

  const STATS = stats ? [
    { label: "Total Jobs",       value: stats.jobs?.total ?? 0,        icon: Briefcase },
    { label: "Active",           value: stats.jobs?.active ?? 0,       icon: Briefcase },
    { label: "Applications",     value: stats.applications?.total ?? 0, icon: FileText  },
    { label: "Pending Review",   value: stats.applications?.pending ?? 0, icon: Users  },
  ] : [];

  return (
    <RoleGuard allowedRoles={["recruiter"]}>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-background flex">
        <Sidebar />

        <div className="ml-60 flex-1 min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-background border-b border-border px-6 h-14 flex items-center justify-between">
            <h1 className="font-semibold text-foreground text-sm">Recruiter Dashboard</h1>
            <Link href="/recruiter/jobs/new" className="btn-primary flex items-center gap-1.5 text-xs">
              <PlusCircle className="h-3.5 w-3.5" />
              Post a Job
            </Link>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATS.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="spotlight-card">
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-foreground-muted mt-1 flex items-center gap-1">
                      <Icon className="h-3 w-3" />{label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-1">
              {["all", "active", "draft", "closed"].map((s) => (
                <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                  className={`filter-pill capitalize ${statusFilter === s ? "active" : ""}`}>
                  {s === "all" ? "All jobs" : s}
                </button>
              ))}
            </div>

            {/* Jobs table */}
            <div className="rounded-lg border border-border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 px-5 py-2.5 text-xs font-medium text-foreground-dim bg-surface-2 border-b border-border">
                <span className="col-span-5">Job</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-2">Posted</span>
                <span className="col-span-1 text-center">Apps</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16"><div className="spinner h-7 w-7" /></div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <Briefcase className="h-8 w-8 text-foreground-dim mb-3" />
                  <p className="text-foreground text-sm font-medium">No jobs posted yet</p>
                  <Link href="/recruiter/jobs/new" className="btn-primary text-xs mt-4">Post your first job</Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job._id} className="job-row grid grid-cols-12 items-center px-5 py-4 border-b border-border last:border-0">
                    <div className="col-span-5 min-w-0 pr-4">
                      <p className="font-semibold text-foreground text-sm truncate">{job.title}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{job.company}</p>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[job.status] || STATUS_COLORS.draft}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-xs text-foreground-muted">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                    </div>
                    <div className="col-span-1 text-center text-sm font-semibold text-foreground">
                      {job.applicationsCount ?? 0}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <Link href={`/recruiter/jobs/${job._id}`}
                        className="p-1.5 text-foreground-dim hover:text-foreground transition-colors rounded-md hover:bg-surface">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={`/recruiter/jobs/${job._id}/edit`}
                        className="p-1.5 text-foreground-dim hover:text-foreground transition-colors rounded-md hover:bg-surface">
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      {job.status !== "closed" && (
                        <button onClick={() => handleClose(job._id)}
                          className="p-1.5 text-foreground-dim hover:text-warning transition-colors rounded-md hover:bg-surface">
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(job._id)}
                        className="p-1.5 text-foreground-dim hover:text-error transition-colors rounded-md hover:bg-surface">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-outline disabled:opacity-30">← Prev</button>
                <span className="text-xs text-foreground-muted">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="btn-outline disabled:opacity-30">Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
