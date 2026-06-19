"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import RoleGuard from "@/components/RoleGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import { getAllUsers, suspendUser, activateUser, deleteUser, updateUserRole } from "@/services/adminService";
import toast, { Toaster } from "react-hot-toast";
import {
  Search, Users, Shield, Briefcase, UserCheck, UserX,
  MoreVertical, RefreshCw, ChevronDown, Check,
} from "lucide-react";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

/* ── Role & status badge styles ─────────────────────────────────────────── */
const ROLE_STYLE = {
  job_seeker: { bg: "rgba(13,81,255,0.1)",  color: "#6B9FFF", label: "Job Seeker",  icon: Briefcase },
  recruiter:  { bg: "rgba(245,158,11,0.1)", color: "#FBB040", label: "Recruiter",   icon: Users },
  admin:      { bg: "rgba(139,92,246,0.1)", color: "#A78BFA", label: "Admin",       icon: Shield },
};
const STATUS_STYLE = {
  active:    { bg: "rgba(16,185,129,0.1)", color: "#34D399", label: "Active" },
  suspended: { bg: "rgba(239,68,68,0.1)",  color: "#F87171", label: "Suspended" },
};

/* ── Action dropdown for each row ───────────────────────────────────────── */
function ActionMenu({ user, onRefresh }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const act = async (fn, label) => {
    setOpen(false);
    try {
      const res = await fn();
      if (res.success) { toast.success(label, TOAST); onRefresh(); }
    } catch (e) { toast.error(e.message || "Failed", TOAST); }
  };

  const handleSuspend = () => {
    const reason = window.prompt(`Suspension reason for ${user.name}:`);
    if (!reason) return;
    act(() => suspendUser(user._id, reason), "User suspended");
  };

  const handleRole = () => {
    const roles = ["job_seeker", "recruiter", "admin"].filter((r) => r !== user.userRole);
    const choice = window.prompt(`Change role (${roles.join(" / ")}):`);
    if (!choice || !["job_seeker", "recruiter", "admin"].includes(choice)) {
      toast.error("Invalid role", TOAST);
      return;
    }
    act(() => updateUserRole(user._id, choice), "Role updated");
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    act(() => deleteUser(user._id), "User deleted");
  };

  const isAdmin = user.userRole === "admin";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md transition-colors"
        style={{ color: "var(--foreground-dim)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.background = "var(--surface)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; e.currentTarget.style.background = "transparent"; }}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl z-50 overflow-hidden shadow-2xl"
          style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="py-1">
            {user.accountStatus === "suspended" ? (
              <button onClick={() => act(() => activateUser(user._id), "User activated")}
                className="w-full text-left px-4 py-2 text-xs transition-colors"
                style={{ color: "#34D399" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                ✓ Activate account
              </button>
            ) : (
              !isAdmin && (
                <button onClick={handleSuspend}
                  className="w-full text-left px-4 py-2 text-xs transition-colors"
                  style={{ color: "#FBB040" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  ⊘ Suspend account
                </button>
              )
            )}
            {!isAdmin && (
              <button onClick={handleRole}
                className="w-full text-left px-4 py-2 text-xs transition-colors"
                style={{ color: "var(--foreground-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                ↕ Change role
              </button>
            )}
            {!isAdmin && (
              <button onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-xs transition-colors"
                style={{ color: "#F87171" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                ✕ Delete user
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Filter dropdown ─────────────────────────────────────────────────────── */
function Filter2({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const active = value !== options[0].value;
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
        <ChevronDown className="h-3 w-3 opacity-60" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 rounded-xl z-50 overflow-hidden shadow-2xl"
          style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.1)", minWidth: 140, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
          <div className="py-1.5">
            {options.map((opt) => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors"
                style={{ color: opt.value === value ? "#6B9FFF" : "var(--foreground-muted)", background: opt.value === value ? "rgba(13,81,255,0.1)" : "transparent" }}
                onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = opt.value === value ? "rgba(13,81,255,0.1)" : "transparent"; }}>
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

const ROLE_OPTS   = [{ value:"all", label:"All roles" }, { value:"job_seeker", label:"Job Seekers" }, { value:"recruiter", label:"Recruiters" }, { value:"admin", label:"Admins" }];
const STATUS_OPTS = [{ value:"all", label:"All statuses" }, { value:"active", label:"Active" }, { value:"suspended", label:"Suspended" }];

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function UserManagementPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [roleFilter, setRole]     = useState("all");
  const [statusFilter, setStatus] = useState("all");
  const [searchTerm, setSearch]   = useState("");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotal]    = useState(1);

  const fetch = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const res = await getAllUsers({
        page: pg, limit: 20,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      if (res.success) {
        setUsers(res.users);
        setTotal(res.pagination?.pages || 1);
      }
    } catch (e) {
      toast.error(e.message || "Failed to load users", TOAST);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, page, searchTerm]);

  useEffect(() => { fetch(); }, [fetch]);

  const refresh = () => fetch(page);

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
              <Users className="h-4 w-4" style={{ color: "var(--foreground-dim)" }} />
              <h1 className="text-sm font-semibold text-foreground">User Management</h1>
            </div>
            <button onClick={refresh} disabled={loading}
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
                  placeholder="Search name or email…"
                  value={searchTerm}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); fetch(1); } }}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground)" }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(13,81,255,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; }}
                />
              </div>
              <Filter2 label="Role" options={ROLE_OPTS} value={roleFilter} onChange={(v) => { setRole(v); setPage(1); }} />
              <Filter2 label="Status" options={STATUS_OPTS} value={statusFilter} onChange={(v) => { setStatus(v); setPage(1); }} />
              <span className="ml-auto text-xs" style={{ color: "var(--foreground-dim)" }}>
                {users.length} user{users.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Header */}
              <div className="grid grid-cols-12 px-5 py-2.5 text-[0.67rem] font-semibold tracking-wider border-b"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", color: "var(--foreground-dim)" }}>
                <span className="col-span-4">USER</span>
                <span className="col-span-2">ROLE</span>
                <span className="col-span-2">STATUS</span>
                <span className="col-span-2">JOINED</span>
                <span className="col-span-1">SKILLS</span>
                <span className="col-span-1 text-right">ACTIONS</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner h-7 w-7" /></div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Users className="h-10 w-10 opacity-30" style={{ color: "var(--foreground-dim)" }} />
                  <p className="text-sm text-foreground font-medium">No users found</p>
                  <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>Try adjusting your filters</p>
                </div>
              ) : (
                users.map((u) => {
                  const role   = ROLE_STYLE[u.userRole]   || ROLE_STYLE.job_seeker;
                  const status = STATUS_STYLE[u.accountStatus] || STATUS_STYLE.active;
                  const RoleIcon = role.icon;
                  return (
                    <div key={u._id}
                      className="grid grid-cols-12 items-center px-5 py-3.5 border-b transition-colors"
                      style={{ borderColor: "rgba(255,255,255,0.055)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>

                      {/* User */}
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm text-white shrink-0"
                          style={{ background: role.color + "30", color: role.color, border: `1px solid ${role.color}40` }}>
                          {u.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                          <p className="text-[0.7rem] truncate" style={{ color: "var(--foreground-dim)" }}>{u.email}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1 text-[0.67rem] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: role.bg, color: role.color }}>
                          <RoleIcon className="h-2.5 w-2.5" />
                          {role.label}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className="text-[0.67rem] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>

                      {/* Joined */}
                      <div className="col-span-2 text-xs" style={{ color: "var(--foreground-muted)" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"2-digit" }) : "—"}
                      </div>

                      {/* Skills count */}
                      <div className="col-span-1 text-xs font-semibold text-foreground">
                        {u.skills?.length > 0 ? u.skills.length : <span style={{ color: "var(--foreground-dim)" }}>—</span>}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-end">
                        <ActionMenu user={u} onRefresh={refresh} />
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
                  className="text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground-muted)" }}>
                  ← Prev
                </button>
                <span className="text-xs px-3" style={{ color: "var(--foreground-dim)" }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
                  className="text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-30"
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
