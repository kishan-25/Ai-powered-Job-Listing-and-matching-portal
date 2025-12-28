"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { getUserFromLocalStorage } from "@/services/authService";
import { logout } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  PlusCircle,
  Bookmark,
  Users,
  Settings,
  BarChart,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Sidebar({ className }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const userData = user || getUserFromLocalStorage();
  const userRole = userData?.userRole || 'job_seeker';
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Role-specific navigation items
  const getNavItems = () => {
    switch (userRole) {
      case 'job_seeker':
        return [
          {
            href: "/dashboard",
            label: "Browse Jobs",
            icon: Briefcase,
            active: pathname === "/dashboard"
          },
          {
            href: "/dashboard/profile",
            label: "Applied Jobs",
            icon: FileText,
            active: pathname === "/dashboard/profile" || pathname === "/dashboard/profile/edit"
          },
          {
            href: "/dashboard/saved",
            label: "Saved Jobs",
            icon: Bookmark,
            active: pathname === "/dashboard/saved"
          },
          {
            href: "/dashboard/profile/edit",
            label: "Profile",
            icon: User,
            active: pathname === "/dashboard/profile/edit"
          }
        ];

      case 'recruiter':
        return [
          {
            href: "/recruiter",
            label: "My Jobs",
            icon: LayoutDashboard,
            active: pathname === "/recruiter"
          },
          {
            href: "/recruiter/jobs/new",
            label: "Post Job",
            icon: PlusCircle,
            active: pathname === "/recruiter/jobs/new"
          },
          {
            href: "/profile",
            label: "Profile",
            icon: User,
            active: pathname === "/profile"
          }
        ];

      case 'admin':
        return [
          {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/admin"
          },
          {
            href: "/admin/users",
            label: "Users",
            icon: Users,
            active: pathname.startsWith("/admin/users")
          },
          {
            href: "/admin/jobs",
            label: "Jobs",
            icon: Briefcase,
            active: pathname === "/admin/jobs"
          }
        ];

      default:
        return [];
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const navItems = getNavItems();

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-border">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TalentAlign</span>
          </Link>
        )}
        {isCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">T</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative",
                  item.active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}

                {/* Active indicator */}
                {item.active && !isCollapsed && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-2 h-2 w-2 rounded-full bg-white"
                  />
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error transition-all group relative"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}

          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Logout
            </div>
          )}
        </button>

        {/* User Info */}
        {!isCollapsed && userData && (
          <div className="px-4 py-3 mt-2 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {userData.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userData.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userData.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all mt-2"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
