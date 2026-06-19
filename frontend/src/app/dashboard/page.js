"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";
import { calculateJobSkillMatch } from "@/utils/jobMatching";
import { getUserFromLocalStorage, getToken } from "@/services/authService";
import { Sidebar } from "@/components/ui/Sidebar";
import { JobRow } from "@/components/ui/JobRow";
import {
  Search, MapPin, ChevronDown, AlertCircle,
  Sparkles, TrendingUp, Check,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { cleanTitle, cleanCompany } from "@/utils/logoUtils";

/* ══════════════════════════════════════════════════════════════════════════
   Dropdown filter component
   ══════════════════════════════════════════════════════════════════════════ */
function FilterDropdown({ label, options, value, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = value !== options[0].value;
  const selected = options.find((o) => o.value === value) || options[0];

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all select-none"
        style={{
          background: active ? "rgba(13,81,255,0.14)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${active ? "rgba(13,81,255,0.45)" : "rgba(255,255,255,0.1)"}`,
          color: active ? "#6B9FFF" : "var(--foreground-muted)",
        }}
      >
        {Icon && <Icon className="h-3 w-3 opacity-70" />}
        <span>{active ? selected.label : label}</span>
        <ChevronDown
          className="h-3 w-3 opacity-60 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 rounded-xl z-50 overflow-hidden shadow-2xl"
          style={{
            background: "var(--surface-2)",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: "160px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div className="py-1.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors"
                style={{
                  color: opt.value === value ? "#6B9FFF" : "var(--foreground-muted)",
                  background: opt.value === value ? "rgba(13,81,255,0.1)" : "transparent",
                }}
                onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }}
              >
                <span className={opt.value === value ? "font-semibold" : "font-medium"}>{opt.label}</span>
                {opt.value === value && <Check className="h-3 w-3" style={{ color: "#6B9FFF" }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Filter option sets
   ══════════════════════════════════════════════════════════════════════════ */
const WORKPLACE_OPTS = [
  { value: "all",     label: "Workplace" },
  { value: "remote",  label: "Remote" },
  { value: "hybrid",  label: "Hybrid" },
  { value: "onsite",  label: "On-site" },
];

const TYPE_OPTS = [
  { value: "all",        label: "Job type" },
  { value: "full-time",  label: "Full-time" },
  { value: "part-time",  label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract",   label: "Contract" },
];

const MATCH_OPTS = [
  { value: "all",  label: "Match %" },
  { value: "80",   label: "Strong  80%+" },
  { value: "60",   label: "Good    60%+" },
  { value: "40",   label: "Fair    40%+" },
];

const POSTED_OPTS = [
  { value: "all",   label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week",  label: "This week" },
  { value: "month", label: "This month" },
];

const EXP_OPTS = [
  { value: "all",     label: "Experience" },
  { value: "fresher", label: "Fresher / 0–1 yr" },
  { value: "1-3",     label: "1–3 years" },
  { value: "3-5",     label: "3–5 years" },
  { value: "5+",      label: "5+ years" },
];

/* ══════════════════════════════════════════════════════════════════════════
   Stat chip
   ══════════════════════════════════════════════════════════════════════════ */
function StatChip({ value, label, color }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-bold tabular-nums" style={{ color: color || "var(--foreground)" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="text-xs" style={{ color: "var(--foreground-dim)" }}>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════════════════ */
function msAgo(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d) ? Infinity : Date.now() - d.getTime();
}

function matchesPosted(job, posted) {
  if (posted === "all") return true;
  const ms = msAgo(job.createdAt || job.date || job.postedDate);
  if (posted === "today")  return ms < 86400000;
  if (posted === "week")   return ms < 7 * 86400000;
  if (posted === "month")  return ms < 30 * 86400000;
  return true;
}

function matchesType(job, type) {
  if (type === "all") return true;
  const t = (job.jobType || job.job_type || job.workMode || "").toLowerCase();
  if (type === "full-time")  return t.includes("full");
  if (type === "part-time")  return t.includes("part");
  if (type === "internship") return t.includes("intern");
  if (type === "contract")   return t.includes("contract");
  return true;
}

function matchesWorkplace(job, wp) {
  if (wp === "all") return true;
  const m = (job.workMode || job.work_mode || job.job_type || "").toLowerCase();
  if (wp === "remote")  return m.includes("remote");
  if (wp === "hybrid")  return m.includes("hybrid");
  if (wp === "onsite")  return m.includes("onsite") || m.includes("on-site") || m.includes("office");
  return true;
}

function matchesExp(job, exp) {
  if (exp === "all") return true;
  const raw = (job.experience || "").toLowerCase();
  if (exp === "fresher") return /0|1|fresh|junior|entry|trainee/.test(raw);
  if (exp === "1-3")     return /[123]/.test(raw);
  if (exp === "3-5")     return /[345]/.test(raw);
  if (exp === "5+")      return /[5-9]|10|senior/.test(raw);
  return true;
}

/* ══════════════════════════════════════════════════════════════════════════
   Dashboard
   ══════════════════════════════════════════════════════════════════════════ */
function DashboardInner() {
  const [allJobs, setAllJobs]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [savedCount, setSaved]  = useState(0);
  const [page, setPage]         = useState(1);
  const PER = 25;

  // Search / filter state
  const [search, setSearch]     = useState("");
  const [location, setLocation] = useState("");
  const [workplace, setWp]      = useState("all");
  const [jobType, setType]      = useState("all");
  const [matchMin, setMatch]    = useState("all");
  const [posted, setPosted]     = useState("all");
  const [experience, setExp]    = useState("all");

  const router   = useRouter();
  const params   = useSearchParams();
  const { user } = useSelector((s) => s.auth);
  const userData = user || getUserFromLocalStorage();
  const name     = userData?.name?.split(" ")[0] || "there";
  const skills   = userData?.skills || [];

  // Pre-fill from URL params
  useEffect(() => {
    if (params.get("search"))   setSearch(params.get("search"));
    if (params.get("location")) setLocation(params.get("location"));
    if (params.get("workMode")) setWp(params.get("workMode"));
  }, [params]);

  // Saved count
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    axios.get(`${API_BASE_URL}/api/v1/users/saved-jobs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (r.data.success) setSaved(r.data.savedJobs?.length ?? 0); })
      .catch(() => {});
  }, []);

  // Fetch + score
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [telRes, timesRes] = await Promise.all([fetchTelegramJobs(), fetchTimesJobs()]);
        let jobs = [];
        if (telRes.success) {
          jobs = jobs.concat(telRes.jobs.map((j) => {
            const m = calculateJobSkillMatch(skills, j.text || "", j.title || "", j.keySkills || "");
            return { ...j, source: "telegram", matchPercentage: m.matchPercentage, workMode: j.workMode || j.job_type || "" };
          }));
        }
        if (timesRes.success) {
          jobs = jobs.concat(timesRes.jobs.map((j) => {
            const m = calculateJobSkillMatch(skills, j.description || "", j.title || "", j.keySkills || "");
            return { ...j, source: "timesjob", matchPercentage: m.matchPercentage, workMode: j.workMode || j.job_type || "" };
          }));
        }
        jobs.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        setAllJobs(jobs);
      } catch {
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (userData) load();
  }, [userData]);

  // Apply all filters
  useEffect(() => {
    let jobs = [...allJobs];

    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter((j) =>
        cleanTitle(j.title).toLowerCase().includes(q) ||
        cleanCompany(j.company).toLowerCase().includes(q) ||
        j.text?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.keySkills?.toLowerCase().includes(q)
      );
    }
    if (location) jobs = jobs.filter((j) => j.location?.toLowerCase().includes(location.toLowerCase()));
    if (workplace !== "all")  jobs = jobs.filter((j) => matchesWorkplace(j, workplace));
    if (jobType !== "all")    jobs = jobs.filter((j) => matchesType(j, jobType));
    if (experience !== "all") jobs = jobs.filter((j) => matchesExp(j, experience));
    if (posted !== "all")     jobs = jobs.filter((j) => matchesPosted(j, posted));
    if (matchMin !== "all")   jobs = jobs.filter((j) => (j.matchPercentage || 0) >= Number(matchMin));

    setFiltered(jobs);
    setPage(1);
  }, [search, location, workplace, jobType, matchMin, posted, experience, allJobs]);

  const clearFilters = () => { setSearch(""); setLocation(""); setWp("all"); setType("all"); setMatch("all"); setPosted("all"); setExp("all"); };
  const hasFilters   = search || location || workplace !== "all" || jobType !== "all" || matchMin !== "all" || posted !== "all" || experience !== "all";

  const paged      = filtered.slice((page - 1) * PER, page * PER);
  const totalPages = Math.ceil(filtered.length / PER);
  const matchHigh  = allJobs.filter((j) => (j.matchPercentage || 0) >= 80).length;
  const matchMid   = allJobs.filter((j) => (j.matchPercentage || 0) >= 60 && (j.matchPercentage || 0) < 80).length;

  return (
    <RoleGuard allowedRoles={["job_seeker"]}>
      <div className="min-h-screen bg-background flex">
        <Sidebar />

        <div className="ml-60 flex-1 min-w-0 flex flex-col">

          {/* ── Sticky top bar ──────────────────────────────────────── */}
          <div
            className="sticky top-0 z-30 border-b px-6 py-3 space-y-2.5"
            style={{ background: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            {/* Search row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input
                  type="text"
                  placeholder="Role, company, skill…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(13,81,255,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; }}
                />
              </div>
              <div className="relative w-44">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(13,81,255,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; }}
                />
              </div>
            </div>

            {/* Filter dropdowns row */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterDropdown label="Workplace"  options={WORKPLACE_OPTS} value={workplace}   onChange={setWp}      />
              <FilterDropdown label="Job type"   options={TYPE_OPTS}      value={jobType}     onChange={setType}    />
              <FilterDropdown label="Match %"    options={MATCH_OPTS}     value={matchMin}    onChange={setMatch}   />
              <FilterDropdown label="Any time"   options={POSTED_OPTS}    value={posted}      onChange={setPosted}  />
              <FilterDropdown label="Experience" options={EXP_OPTS}       value={experience}  onChange={setExp}     />

              {/* Divider + result count */}
              <div className="w-px h-4 ml-1" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-xs" style={{ color: "var(--foreground-dim)" }}>
                {loading ? "Loading…" : `${filtered.length.toLocaleString()} result${filtered.length !== 1 ? "s" : ""}`}
              </span>

              {/* Clear all */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs underline underline-offset-2 transition-colors"
                  style={{ color: "var(--foreground-dim)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* ── Page body ─────────────────────────────────────────────── */}
          <div className="flex-1 px-6 py-5 space-y-4">

            {/* ── Greeting + stats card ─────────────────────────────── */}
            {!loading && allJobs.length > 0 && (
              <div
                className="rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5"
                style={{
                  background: "linear-gradient(135deg, rgba(13,81,255,0.08) 0%, rgba(13,81,255,0.02) 100%)",
                  border: "1px solid rgba(13,81,255,0.15)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-foreground mb-0.5">
                    Welcome back,{" "}
                    <span style={{ color: "#6B9FFF" }}>{name}</span> 👋
                  </h1>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    {matchHigh > 0
                      ? `${matchHigh} strong match${matchHigh !== 1 ? "es" : ""} based on your skills`
                      : skills.length === 0
                        ? "Add your skills to unlock AI-powered job matching"
                        : "Browse jobs below — more skills improve your match scores"}
                  </p>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {skills.slice(0, 7).map((s) => (
                        <span key={s} className="text-[0.67rem] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(13,81,255,0.12)", color: "#6B9FFF", border: "1px solid rgba(13,81,255,0.2)" }}>
                          {s}
                        </span>
                      ))}
                      {skills.length > 7 && (
                        <span className="text-[0.67rem] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)", color: "var(--foreground-dim)" }}>
                          +{skills.length - 7}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 sm:gap-8 shrink-0 sm:pl-6 pt-4 sm:pt-0"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <StatChip value={allJobs.length} label="jobs" />
                  <StatChip value={matchHigh} label="strong" color="#34D399" />
                  <StatChip value={matchMid}  label="good"   color="#FBB040" />
                  <StatChip value={savedCount} label="saved"  color="var(--foreground-muted)" />
                </div>
              </div>
            )}

            {/* ── No skills alert ───────────────────────────────────── */}
            {!loading && skills.length === 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <Sparkles className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#FBB040" }} />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">Add skills to unlock AI matching</p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    All jobs show 0% match.{" "}
                    <a href="/dashboard/profile/edit" className="underline" style={{ color: "var(--primary)" }}>Edit profile →</a>
                  </p>
                </div>
              </div>
            )}

            {/* ── Job list ─────────────────────────────────────────── */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

              {/* Column header */}
              {!loading && paged.length > 0 && (
                <div className="flex items-center justify-between px-5 py-2.5 text-[0.67rem] font-semibold tracking-wider border-b"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", color: "var(--foreground-dim)" }}>
                  <span>POSITION</span>
                  <span>MATCH · ACTION</span>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="spinner h-7 w-7" />
                  <p className="text-sm" style={{ color: "var(--foreground-dim)" }}>Finding the best matches…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
                  <AlertCircle className="h-8 w-8" style={{ color: "var(--error)" }} />
                  <p className="text-sm font-medium text-foreground">{error}</p>
                  <button onClick={() => window.location.reload()} className="text-xs underline" style={{ color: "var(--primary)" }}>Retry</button>
                </div>
              ) : paged.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-2 text-center px-6">
                  <TrendingUp className="h-10 w-10 mb-1" style={{ color: "var(--foreground-dim)", opacity: 0.3 }} />
                  <p className="text-sm font-semibold text-foreground">No jobs match your filters</p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                    Try broadening your search or removing a filter
                  </p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="mt-2 text-xs underline" style={{ color: "var(--primary)" }}>
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                paged.map((job, i) => (
                  <JobRow
                    key={job._id || job.id || `job-${i}`}
                    job={job}
                    onApply={(j) => router.push(`/dashboard/apply?jobId=${j._id}&source=${j.source || "telegram"}`)}
                  />
                ))
              )}
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  className="text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground-muted)" }}
                >← Prev</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`d-${i}`} className="text-xs px-1" style={{ color: "var(--foreground-dim)" }}>…</span>
                    ) : (
                      <button key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className="text-xs h-8 w-8 rounded-lg transition-all font-medium"
                        style={{
                          background: page === p ? "var(--primary)" : "var(--surface-2)",
                          border: `1px solid ${page === p ? "var(--primary)" : "rgba(255,255,255,0.09)"}`,
                          color: page === p ? "#fff" : "var(--foreground-muted)",
                        }}
                      >{p}</button>
                    )
                  )}

                <button
                  onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  className="text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground-muted)" }}
                >Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="spinner h-8 w-8" /></div>}>
      <DashboardInner />
    </Suspense>
  );
}
