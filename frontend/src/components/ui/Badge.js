"use client";
import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className, ...props }) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-secondary/10 text-secondary border border-secondary/20",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    error: "bg-error/10 text-error border border-error/20",
    info: "bg-info/10 text-info border border-info/20",
    outline: "border border-border text-foreground bg-transparent"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
