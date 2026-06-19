"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import { getSystemAnalytics } from "@/services/adminService";
import toast, { Toaster } from "react-hot-toast";
import { Users, Briefcase, FileText, UserCheck, UserX, RefreshCw } from "lucide-react";

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
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { load(); }, []);

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
