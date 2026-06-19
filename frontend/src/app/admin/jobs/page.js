"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import RoleGuard from "@/components/RoleGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import { getAllJobs, closeAnyJob } from "@/services/adminService";
import toast, { Toaster } from "react-hot-toast";
import { Briefcase, Search, RefreshCw, MapPin, XCircle, ChevronDown, Check } from "lucide-react";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

const SOURCE_STYLE = {
  recruiter: { bg: "rgba(13,81,255,0.1)",   color: "#6B9FFF",  label: "Posted" },
  telegram:  { bg: "rgba(38,165,228,0.1)",  color: "#26A5E4",  label: "Telegram" },
  timesjob:  { bg: "rgba(232,77,61,0.1)",   color: "#E84D3D",  label: "TimesJobs" },
  timesjobs: { bg: "rgba(232,77,61,0.1)",   color: "#E84D3D",  label: "TimesJobs" },
  hirejobs:  { bg: "rgba(124,58,237,0.1)",  color: "#7C3AED",  label: "HireJobs" },
  instahyre: { bg: "rgba(5,150,105,0.1)",   color: "#059669",  label: "Instahyre" },
};
const STATUS_STYLE = {
  active: { bg: "rgba(16,185,129,0.1)",  color: "#34D399", label: "Active" },
  draft:  { bg: "rgba(245,158,11,0.1)",  color: "#FBB040", label: "Draft" },
  closed: { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: "Closed" },
};

function FilterPill({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const active  = value !== options[0].value;
  const selected = options.find((o) => o.value === value) || options[0];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all"
        style={{
          background: active ? "rgba(13,81,255,0.12)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${active ? "rgba(13,81,255,0.4)" : "rgba(255,255,255,0.09)"}`,
          color: active ? "#6B9FFF" : "var(--foreground-muted)",
        }}>
        {active ? selected.label : label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 rounded-xl z-50 overflow-hidden shadow-2xl"
          style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.1)", minWidth: 150, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
          <div className="py-1.5">
            {options.map((opt) => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors"
                style={{ color: opt.value === value ? "#6B9FFF" : "var(--foreground-muted)", background: opt.value === value ? "rgba(13,81,255,0.1)" : "transparent" }}
                onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }}>
                <span className={opt.value === value ? "font-semibold" : "font-medium"}>{opt.label}</span>
                {opt.value === value && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SOURCE_OPTS = [
  { value:"all", label:"All sources" }, { value:"recruiter", label:"Recruiter posted" },
  { value:"telegram", label:"Telegram" }, { value:"timesjob", label:"TimesJobs" },
  { value:"hirejobs", label:"HireJobs" }, { value:"instahyre", label:"Instahyre" },
];
const STATUS_OPTS = [
  { value:"all", label:"All statuses" }, { value:"active", label:"Active" },
  { value:"draft", label:"Draft" }, { value:"closed", label:"Closed" },
];

export default function AdminJobsPage() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState("");
  const [source, setSource]   = useState("all");
  const [status, setStatus]   = useState("all");
  const [page, setPage]       = useState(1);
  const [totalPages, setPages]= useState(1);

  const fetch = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const res = await getAllJobs({
        page: pg, limit: 25,
        search: search || undefined,
        source: source !== "all" ? source : undefined,
        status: status !== "all" ? status : undefined,
      });
      if (res.success) {
        setJobs(res.jobs);
        setTotal(res.pagination?.total || res.jobs.length);
        setPages(res.pagination?.pages || 1);
      }
    } catch (e) {
      toast.error(e.message || "Failed to load jobs", TOAST);
    } finally {
      setLoading(false);
    }
  }, [search, source, status, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleClose = async (id) => {
    if (!window.confirm("Close this job listing?")) return;
    try {
      const res = await closeAnyJob(id);
      if (res.success) { toast.success("Job closed", TOAST); fetch(page); }
    } catch (e) { toast.error(e.message || "Failed", TOAST); }
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-background flex">
        <Sidebar />

        <div className="ml-60 flex-1 min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 border-b"
            style={{ background: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4" style={{ color: "var(--foreground-dim)" }} />
              <h1 className="text-sm font-semibold text-foreground">All Jobs</h1>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "var(--foreground-dim)" }}>
                {total.toLocaleString()}
              </span>
            </div>
            <button onClick={() => fetch(page)} disabled={loading}
              className="flex items-center gap-1.5 text-xs btn-outline disabled:opacity-40">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Search + filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-52 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input
                  type="text"
                  placeholder="Search title or company…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); fetch(1); } }}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(13,81,255,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; }}
                />
              </div>
              <FilterPill label="Source" options={SOURCE_OPTS} value={source} onChange={(v) => { setSource(v); setPage(1); }} />
              <FilterPill label="Status" options={STATUS_OPTS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
              <span className="ml-auto text-xs" style={{ color: "var(--foreground-dim)" }}>
                {jobs.length} shown
              </span>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Header */}
              <div className="grid grid-cols-12 px-5 py-2.5 text-[0.67rem] font-semibold tracking-wider border-b"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", color: "var(--foreground-dim)" }}>
                <span className="col-span-4">JOB</span>
                <span className="col-span-2">SOURCE</span>
                <span className="col-span-2">STATUS</span>
                <span className="col-span-2">POSTED</span>
                <span className="col-span-1 text-center">APPS</span>
                <span className="col-span-1 text-right">ACTION</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner h-7 w-7" /></div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Briefcase className="h-10 w-10 opacity-30" style={{ color: "var(--foreground-dim)" }} />
                  <p className="text-sm font-medium text-foreground">No jobs found</p>
                </div>
              ) : (
                jobs.map((job, i) => {
                  const src = SOURCE_STYLE[job.source?.toLowerCase()] || SOURCE_STYLE.recruiter;
                  const sts = STATUS_STYLE[job.status] || STATUS_STYLE.active;
                  return (
                    <div key={job._id || i}
                      className="grid grid-cols-12 items-center px-5 py-3.5 border-b transition-colors"
                      style={{ borderColor: "rgba(255,255,255,0.055)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>

                      {/* Job */}
                      <div className="col-span-4 min-w-0 pr-3">
                        <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[0.7rem]" style={{ color: "var(--foreground-muted)" }}>
                          <span className="font-medium truncate max-w-[120px]">{job.company}</span>
                          {job.location && (
                            <><span style={{ color: "var(--foreground-dim)" }}>·</span>
                            <span className="flex items-center gap-0.5 truncate max-w-[100px]">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />{job.location}
                            </span></>
                          )}
                        </div>
                      </div>

                      {/* Source */}
                      <div className="col-span-2">
                        <span className="text-[0.67rem] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: src.bg, color: src.color }}>{src.label}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className="text-[0.67rem] font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: sts.bg, color: sts.color }}>{sts.label}</span>
                      </div>

                      {/* Posted date */}
                      <div className="col-span-2 text-xs" style={{ color: "var(--foreground-muted)" }}>
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"2-digit" }) : "—"}
                      </div>

                      {/* Apps count */}
                      <div className="col-span-1 text-center text-sm font-semibold text-foreground">
                        {job.applicationsCount ?? 0}
                      </div>

                      {/* Action */}
                      <div className="col-span-1 flex justify-end">
                        {job.status !== "closed" && job.source === "recruiter" && (
                          <button onClick={() => handleClose(job._id)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: "var(--foreground-dim)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error)"; e.currentTarget.style.background = "var(--surface)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; e.currentTarget.style.background = "transparent"; }}
                            title="Close job">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}
                  className="text-xs px-4 py-2 rounded-lg disabled:opacity-30 transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground-muted)" }}>
                  ← Prev
                </button>
                <span className="text-xs px-3" style={{ color: "var(--foreground-dim)" }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
                  className="text-xs px-4 py-2 rounded-lg disabled:opacity-30 transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground-muted)" }}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
