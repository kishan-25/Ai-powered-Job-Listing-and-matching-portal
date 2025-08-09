"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = ({ items, className = "" }) => {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 mb-4 ${className}`} aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center hover:text-black transition-colors"
        title="Home"
      >
        <Home size={16} />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-black transition-colors"
              title={item.label}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-black font-medium" title={item.label}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
