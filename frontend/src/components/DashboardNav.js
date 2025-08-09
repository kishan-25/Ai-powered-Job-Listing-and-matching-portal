"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, FileText, Briefcase } from "lucide-react";

const DashboardNav = ({ className = "" }) => {
  const pathname = usePathname();

  const navItems = [
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
      active: pathname === "/dashboard/profile" || pathname === "/dashboard/profile/edit"
    }
  ];

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
                item.active
                  ? "bg-lime-300 text-black font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-lime-100 hover:text-black"
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
