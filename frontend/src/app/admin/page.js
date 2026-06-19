"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import { getSystemAnalytics } from "@/services/adminService";
import toast, { Toaster } from "react-hot-toast";
import { Users, Briefcase, FileText, UserCheck, UserX, RefreshCw, Play, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { getToken } from "@/services/authService";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

function StatBlock({ label, value, sub, icon: Icon }) {
  return (
    <div className="spotlight-card">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-foreground-muted">{label}</p>
        <Icon className="h-4 w-4 text-foreground-dim" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value ?? "—"}</p>
      {sub && <p className="text-xs text-foreground-muted mt-1">{sub}</p>}
    </div>
  );
}

function BarRow({ label, value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-foreground-muted w-24 truncate shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-foreground w-12 text-right tabular-nums">{value?.toLocaleString() ?? 0}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [schedStatus, setSchedStatus] = useState(null);
  const [scraping, setScraping]     = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSystemAnalytics();
      if (res.success) setData(res.analytics);
    } catch (e) {
      toast.error(e.message || "Failed to load analytics", TOAST);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedulerStatus = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/scheduler-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setSchedStatus(res.data);
    } catch { /* non-critical */ }
  };

  const triggerScraper = async () => {
    setScraping(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/api/v1/admin/run-scrapers`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Scrapers started in background! Check back in ~30 minutes.", TOAST);
      setTimeout(loadSchedulerStatus, 5000);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to trigger scrapers", TOAST);
    } finally {
      setScraping(false);
    }
  };

  useEffect(() => { load(); loadSchedulerStatus(); }, []);

  const u = data?.users;
  const j = data?.jobs;
  const a = data?.applications;

  const scrapedMax = Math.max(j?.scraped?.telegram ?? 0, j?.scraped?.timesJob ?? 0, j?.scraped?.hireJobs ?? 0, j?.scraped?.instahyre ?? 0, 1);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-background flex">
        <Sidebar />

        <div className="ml-60 flex-1 min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-background border-b border-border px-6 h-14 flex items-center justify-between">
            <h1 className="font-semibold text-foreground text-sm">System Analytics</h1>
            <button onClick={load} disabled={loading} className="btn-outline flex items-center gap-1.5 text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32"><div className="spinner h-8 w-8" /></div>
          ) : !data ? (
            <div className="flex items-center justify-center py-32 text-foreground-muted text-sm">No data available</div>
          ) : (
            <div className="px-6 py-6 space-y-8">

              {/* Users */}
              <section>
                <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-4">Users</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBlock label="Total"     value={u?.total}      icon={Users}     sub={`+${u?.newLast30Days ?? 0} last 30d`} />
                  <StatBlock label="Active"    value={u?.active}     icon={UserCheck} />
                  <StatBlock label="Suspended" value={u?.suspended}  icon={UserX}     />
                  <StatBlock label="Recruiters" value={u?.byRole?.recruiters} icon={Briefcase} />
                </div>

                {/* Role breakdown bar */}
                <div className="mt-4 spotlight-card space-y-3">
                  <p className="text-xs font-medium text-foreground mb-3">By role</p>
                  {[
                    { label: "Job Seekers", value: u?.byRole?.jobSeekers },
                    { label: "Recruiters",  value: u?.byRole?.recruiters },
                    { label: "Admins",      value: u?.byRole?.admins },
                  ].map(({ label, value }) => (
                    <BarRow key={label} label={label} value={value} max={u?.total} />
                  ))}
                </div>
              </section>

              {/* Jobs */}
              <section>
                <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-4">Jobs</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatBlock label="Total (all sources)" value={j?.total}            icon={Briefcase} />
                  <StatBlock label="Recruiter-posted"    value={j?.recruiterPosted}  icon={Briefcase} />
                  <StatBlock label="Active"              value={j?.byStatus?.active} icon={Briefcase} />
                </div>

                <div className="mt-4 spotlight-card space-y-3">
                  <p className="text-xs font-medium text-foreground mb-3">Scraped sources</p>
                  {[
                    { label: "Telegram",  value: j?.scraped?.telegram },
                    { label: "TimesJobs", value: j?.scraped?.timesJob },
                    { label: "HireJobs",  value: j?.scraped?.hireJobs },
                    { label: "Instahyre", value: j?.scraped?.instahyre },
                  ].map(({ label, value }) => (
                    <BarRow key={label} label={label} value={value} max={scrapedMax} />
                  ))}
                </div>
              </section>

              {/* Applications */}
              <section>
                <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-4">Applications</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBlock label="Total"            value={a?.total}                      icon={FileText} sub={`+${a?.newLast30Days ?? 0} last 30d`} />
                  <StatBlock label="Pending"          value={a?.byStatus?.pending}          icon={FileText} />
                  <StatBlock label="Shortlisted"      value={a?.byStatus?.shortlisted}      icon={FileText} />
                  <StatBlock label="Interview Sched." value={a?.byStatus?.interviewScheduled} icon={FileText} />
                </div>
              </section>

              {/* Scraper scheduler */}
              <section>
                <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-4">Scraper Pipeline</p>
                <div className="rounded-2xl p-5 space-y-4"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}>

                  {/* Status row */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${schedStatus?.schedulerAlive ? "bg-match-high" : "bg-error"}`}
                          style={{ boxShadow: schedStatus?.schedulerAlive ? "0 0 6px #10B981" : "0 0 6px #EF4444" }} />
                        <p className="text-sm font-semibold text-foreground">
                          {schedStatus?.schedulerAlive ? "Scheduler running" : "Scheduler offline"}
                        </p>
                      </div>
                      {schedStatus?.nextRunIST && (
                        <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--foreground-muted)" }}>
                          <Clock className="h-3 w-3" />
                          Next run: <span className="text-foreground font-medium">{schedStatus.nextRunIST}</span>
                          &nbsp;·&nbsp;{schedStatus.scraperCount} scrapers · {schedStatus.maxRetries} retries each
                        </p>
                      )}
                    </div>

                    <button
                      onClick={triggerScraper}
                      disabled={scraping}
                      className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      style={{ background: "var(--primary)", color: "#fff" }}>
                      {scraping
                        ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Starting…</>
                        : <><Play className="h-3.5 w-3.5" />Run scrapers now</>}
                    </button>
                  </div>

                  {/* Last 5 runs */}
                  {schedStatus?.lastRuns?.length > 0 && (
                    <div>
                      <p className="text-[0.67rem] font-bold uppercase tracking-widest mb-2"
                        style={{ color: "var(--foreground-dim)" }}>Recent runs</p>
                      <div className="space-y-1.5">
                        {schedStatus.lastRuns.slice(0, 5).map((run, i) => {
                          const icon = run.status === "success"
                            ? <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#34D399" }} />
                            : run.status === "partial"
                            ? <AlertCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#FBB040" }} />
                            : <XCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#F87171" }} />;
                          return (
                            <div key={i} className="flex items-center gap-2.5 text-xs"
                              style={{ color: "var(--foreground-muted)" }}>
                              {icon}
                              <span className="text-foreground font-medium">{run.status}</span>
                              <span style={{ color: "var(--foreground-dim)" }}>·</span>
                              <span>{new Date(run.startedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                              <span style={{ color: "var(--foreground-dim)" }}>·</span>
                              <span>{run.durationSec}s</span>
                              <span style={{ color: "var(--foreground-dim)" }}>·</span>
                              <span className="capitalize" style={{ color: "var(--foreground-dim)" }}>{run.triggeredBy}</span>
                              {run.failed > 0 && (
                                <span style={{ color: "#F87171" }}>· {run.failed} failed</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Quick actions */}
              <section>
                <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-4">Quick actions</p>
                <div className="flex gap-3">
                  <Link href="/admin/users" className="btn-outline flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Manage Users
                  </Link>
                  <Link href="/admin/jobs" className="btn-outline flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" /> View All Jobs
                  </Link>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
