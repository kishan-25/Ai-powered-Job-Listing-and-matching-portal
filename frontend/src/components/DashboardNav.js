"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "@/services/authService";
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  PlusCircle,
  Bookmark,
  Users,
  Settings,
  BarChart
} from "lucide-react";

const DashboardNav = ({ className = "" }) => {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const userData = user || getUserFromLocalStorage();
  const userRole = userData?.userRole || 'job_seeker';

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
        return [
          {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/dashboard"
          },
          {
            href: "/dashboard/profile",
            label: "Profile",
            icon: User,
            active: pathname === "/dashboard/profile"
          }
        ];
    }
  };

  const navItems = getNavItems();

  // Role-specific color themes
  const getThemeColors = () => {
    switch (userRole) {
      case 'admin':
        return {
          active: "bg-purple-600 text-white font-semibold",
          inactive: "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700"
        };
      case 'recruiter':
        return {
          active: "bg-blue-600 text-white font-semibold",
          inactive: "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
        };
      default: // job_seeker
        return {
          active: "bg-primary text-white font-semibold",
          inactive: "bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary"
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                item.active ? colors.active : colors.inactive
              }`}
            >
              <Icon size={16} className="mr-2" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardNav;
