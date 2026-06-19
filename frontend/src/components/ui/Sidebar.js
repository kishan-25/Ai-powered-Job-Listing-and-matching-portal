"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { getUserFromLocalStorage, removeUserFromLocalStorage } from "@/services/authService";
import { logout } from "@/redux/slices/authSlice";
import toast from "react-hot-toast";
import {
  Briefcase, Bookmark, FileText, User,
  LayoutDashboard, PlusCircle, Users, LogOut,
} from "lucide-react";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

const NAV = {
  job_seeker: [
    { href: "/dashboard",              label: "Browse Jobs",    icon: Briefcase },
    { href: "/dashboard/saved",        label: "Saved Jobs",     icon: Bookmark  },
    { href: "/dashboard/profile",      label: "Applications",   icon: FileText  },
    { href: "/dashboard/profile/edit", label: "Profile",        icon: User      },
  ],
  recruiter: [
    { href: "/recruiter",          label: "Dashboard",  icon: LayoutDashboard },
    { href: "/recruiter/jobs/new", label: "Post a Job", icon: PlusCircle      },
    { href: "/profile",            label: "Profile",    icon: User            },
  ],
  admin: [
    { href: "/admin",       label: "Analytics",  icon: LayoutDashboard },
    { href: "/admin/users", label: "Users",      icon: Users           },
    { href: "/admin/jobs",  label: "Jobs",       icon: Briefcase       },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router   = useRouter();
  const { user } = useSelector((s) => s.auth);
  const userData  = user || getUserFromLocalStorage();
  const role      = userData?.userRole || "job_seeker";
  const navItems  = NAV[role] || NAV.job_seeker;

  const initial = (userData?.name || "U").charAt(0).toUpperCase();

  const handleLogout = () => {
    removeUserFromLocalStorage();
    dispatch(logout());
    toast.success("Logged out successfully", { ...TOAST, duration: 2000 });
    // Small delay so the toast renders before the page unmounts
    setTimeout(() => router.push("/"), 800);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40" style={{ background: "var(--background)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[53px] shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs leading-none">T</span>
          </div>
          <span className="font-bold text-foreground text-sm tracking-tight">TalentAlign</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/") && href !== "/dashboard");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "nav-item-active"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-border p-3 space-y-1 flex-shrink-0">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:text-error hover:bg-surface transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Logout
        </button>

        {/* User chip */}
        {userData && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface mt-1">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{userData.name || "User"}</p>
              <p className="text-[0.7rem] text-foreground-muted truncate">{userData.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
