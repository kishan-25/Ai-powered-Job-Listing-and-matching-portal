"use client";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse bg-muted rounded", className)}
      {...props}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      <div className="flex gap-3 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}
