"use client";
import { useState, useEffect } from "react";
import { Heart, MapPin, Wifi, Home, Building2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { getLogoUrl, cleanTitle, cleanCompany } from "@/utils/logoUtils";

/* ── Colour palette for initial avatars ──────────────────────────────────── */
const PALETTE = [
  "#0D51FF", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#14B8A6",
];
function avatarColor(str) {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/* ── Company Logo ─────────────────────────────────────────────────────────── */
function CompanyLogo({ job }) {
  const company = cleanCompany(job.company || job.companyName || "");
  const initial = company ? company.charAt(0).toUpperCase() : (cleanTitle(job.title).charAt(0).toUpperCase() || "J");
  const color   = avatarColor(company || job.title || "");

  const [src, setSrc]       = useState(null);    // null = loading
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const url = getLogoUrl(job);
    setSrc(url);
    setLoaded(false);
    setFailed(!url);
  }, [job._id]);

  const showImage = src && !failed;

  return (
    <div
      className="h-11 w-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative"
      style={!showImage ? { backgroundColor: color } : { background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {showImage && (
        <Image
          src={src}
          alt={company || "Company"}
          width={44}
          height={44}
          className="h-full w-full object-contain"
          unoptimized
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.2s" }}
        />
      )}
      {/* Show initial while image loads OR on failure */}
      {(!showImage || !loaded) && (
        <span
          className="text-white font-bold text-sm absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

/* ── Work-mode tag ──────────────────────────────────────────────────────── */
function WorkTag({ mode }) {
  if (!mode) return null;
  const m = mode.toUpperCase();
  const isRemote = m.includes("REMOTE");
  const isHybrid = m.includes("HYBRID");
  const icon = isRemote ? <Wifi className="h-2.5 w-2.5" />
    : isHybrid ? <Home className="h-2.5 w-2.5" />
    : <Building2 className="h-2.5 w-2.5" />;
  const label = isRemote ? "REMOTE" : isHybrid ? "HYBRID" : "ON-SITE";

  return (
    <span
      className="inline-flex items-center gap-1 text-[0.67rem] font-semibold px-1.5 py-0.5 rounded"
      style={{
        background: isRemote ? "rgba(16,185,129,0.1)" : isHybrid ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${isRemote ? "rgba(16,185,129,0.25)" : isHybrid ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.1)"}`,
        color: isRemote ? "#34D399" : isHybrid ? "#FBB040" : "var(--foreground-muted)",
      }}
    >
      {icon}{label}
    </span>
  );
}

/* ── Match badge ─────────────────────────────────────────────────────────── */
function MatchBadge({ pct }) {
  if (!pct || pct <= 0) return null;
  const { bg, fg, label } =
    pct >= 80 ? { bg: "rgba(16,185,129,0.12)", fg: "#34D399", label: `${pct}% match` }
    : pct >= 60 ? { bg: "rgba(245,158,11,0.12)", fg: "#FBB040", label: `${pct}%` }
    : { bg: "rgba(107,114,128,0.1)", fg: "#6B7280", label: `${pct}%` };

  return (
    <span
      className="text-[0.67rem] font-bold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-flex items-center gap-1"
      style={{ background: bg, color: fg }}
    >
      {pct >= 80 && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

/* ── Relative time ──────────────────────────────────────────────────────── */
function ago(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ── Main JobRow ─────────────────────────────────────────────────────────── */
export function JobRow({ job, onApply, onSave, isSaved = false }) {
  const [saved, setSaved]     = useState(isSaved);
  const [hovered, setHovered] = useState(false);

  const title   = cleanTitle(job.title || job.job_title);
  const company = cleanCompany(job.company || job.companyName || "");
  const location = job.location || "";
  const workMode = job.workMode || job.work_mode || job.job_type || "";
  const match   = job.matchPercentage || 0;
  const posted  = ago(job.createdAt || job.date || job.postedDate);

  const handleSave = (e) => {
    e.stopPropagation();
    setSaved(!saved);
    onSave?.(job);
  };

  // Meta items with dot separators
  const metaItems = [
    company   && <span key="co" className="font-medium truncate max-w-[160px]" style={{ color: "var(--foreground-muted)" }}>{company}</span>,
    location  && <span key="loc" className="inline-flex items-center gap-0.5 truncate max-w-[120px]" style={{ color: "var(--foreground-muted)" }}><MapPin className="h-2.5 w-2.5 shrink-0" />{location}</span>,
    workMode  && <WorkTag key="wm" mode={workMode} />,
    posted    && <span key="dt" className="shrink-0" style={{ color: "var(--foreground-dim)", fontSize: "0.72rem" }}>{posted}</span>,
  ].filter(Boolean);

  return (
    <div
      className="group flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-all duration-100 border-b"
      style={{
        background: hovered ? "rgba(255,255,255,0.028)" : "transparent",
        borderColor: "rgba(255,255,255,0.055)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onApply?.(job)}
    >
      {/* Logo */}
      <CompanyLogo job={job} />

      {/* Content */}
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className="font-semibold text-[0.9rem] leading-tight"
            style={{ color: hovered ? "#fff" : "var(--foreground)", transition: "color 0.1s" }}
          >
            {title}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {metaItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              {i > 0 && <span style={{ color: "var(--foreground-dim)", fontSize: "0.55rem" }}>·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5 shrink-0">
        <MatchBadge pct={match} />

        <button
          onClick={handleSave}
          aria-label={saved ? "Unsave" : "Save"}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: saved ? "#EF4444" : "var(--foreground-dim)" }}
          onMouseEnter={(e) => { if (!saved) e.currentTarget.style.color = "var(--foreground)"; }}
          onMouseLeave={(e) => { if (!saved) e.currentTarget.style.color = "var(--foreground-dim)"; }}
        >
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onApply?.(job); }}
          className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all"
          style={{
            background: hovered ? "var(--primary)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${hovered ? "var(--primary)" : "rgba(255,255,255,0.12)"}`,
            color: hovered ? "#fff" : "var(--foreground-muted)",
            transition: "all 0.15s",
          }}
        >
          Apply
          {hovered && <ExternalLink className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
