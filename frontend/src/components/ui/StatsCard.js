"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
  delay = 0
}) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === "up") return <TrendingUp className="h-4 w-4" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-error";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>

          {trendValue && (
            <div className={cn("flex items-center gap-1 mt-2 text-sm", getTrendColor())}>
              {getTrendIcon()}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>

      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 h-32 w-32 opacity-5">
        <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-accent blur-2xl" />
      </div>
    </motion.div>
  );
}
