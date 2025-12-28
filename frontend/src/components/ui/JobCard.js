"use client";
import { motion } from "framer-motion";
import { MapPin, Briefcase, DollarSign, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function JobCard({
  job,
  onSave,
  onApply,
  isSaved = false,
  className,
  delay = 0
}) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(job);
  };

  const getMatchPercentage = () => {
    return job.matchPercentage || job.score || 0;
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "text-success bg-success/10";
    if (percentage >= 60) return "text-warning bg-warning/10";
    return "text-muted-foreground bg-muted";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg cursor-pointer",
        className
      )}
      onClick={() => onApply?.(job)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Company Logo */}
          {job.company_logo || job.companyLogo ? (
            <div className="h-12 w-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
              <img
                src={job.company_logo || job.companyLogo}
                alt={job.company || job.companyName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="h-full w-full bg-primary/10 items-center justify-center text-primary font-semibold text-lg hidden"
              >
                {(job.company || job.companyName || 'C').charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-lg">
                {(job.company || job.companyName || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {job.title || job.job_title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {job.company || job.companyName}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {saved ? (
            <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
          ) : (
            <Bookmark className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
        {job.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        )}
        {(job.job_type || job.jobType) && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>{job.job_type || job.jobType}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
        )}
        {job.posted_date && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{job.posted_date}</span>
          </div>
        )}
      </div>

      {/* Skills/Tags */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {/* Match Percentage */}
        {getMatchPercentage() > 0 && (
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
            getMatchColor(getMatchPercentage())
          )}>
            <span>{getMatchPercentage()}% Match</span>
          </div>
        )}

        {/* Apply Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onApply?.(job);
          }}
          className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          Apply Now
        </motion.button>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
