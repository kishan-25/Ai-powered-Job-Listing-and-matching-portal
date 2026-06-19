"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginSuccess } from "@/redux/slices/authSlice";
import AuthGuard from "@/utils/authGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import { getToken, getUserFromLocalStorage } from "@/services/authService";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  User, MapPin, Briefcase, GraduationCap, Globe, Github, Linkedin,
  Plus, X, Save, ArrowLeft, Building2, Phone, Mail, ExternalLink,
  Users, FileText, TrendingUp,
} from "lucide-react";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

/* ── Shared atoms ────────────────────────────────────────────────────────── */
const iStyle = { background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--foreground)" };
const iClass = "w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors";
const iFocus = (e) => { e.target.style.borderColor = "rgba(13,81,255,0.5)"; };
const iBlur  = (e) => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; };

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wide" style={{ color: "var(--foreground-muted)" }}>{label}</label>
      {children}
      {hint && <p className="text-[0.7rem]" style={{ color: "var(--foreground-dim)" }}>{hint}</p>}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--foreground-dim)" }} />
        <p className="text-[0.67rem] font-bold uppercase tracking-widest" style={{ color: "var(--foreground-dim)" }}>{title}</p>
      </div>
      <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {children}
      </div>
    </div>
  );
}

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => { const v = input.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setInput(""); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder} className={iClass + " flex-1"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground-muted)" }}>
          <Plus className="h-3.5 w-3.5" />Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(13,81,255,0.12)", color: "#6B9FFF", border: "1px solid rgba(13,81,255,0.2)" }}>
              {tag}
              <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="hover:text-white transition-colors ml-0.5">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   RECRUITER PROFILE
   ════════════════════════════════════════════════════════════════════════════ */
function RecruiterProfile({ userData, dispatch }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:           userData?.name           || "",
    position:       userData?.position       || "",
    phone:          userData?.phone          || "",
    companyName:    userData?.companyName    || "",
    companyWebsite: userData?.companyWebsite || "",
    location:       userData?.location       || "",
    aboutMe:        userData?.aboutMe        || "",
    linkedin:       userData?.linkedin       || "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e?.preventDefault();
    const token = getToken();
    if (!token) { toast.error("Not logged in", TOAST); return; }
    setLoading(true);
    const t = toast.loading("Saving…", TOAST);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/v1/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const updated = { ...userData, ...form };
        dispatch(loginSuccess(updated));
        const stored = JSON.parse(localStorage.getItem("userData") || "{}");
        localStorage.setItem("userData", JSON.stringify({ ...stored, ...form }));
        toast.success("Profile saved!", { id: t, ...TOAST });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save", { id: t, ...TOAST });
    } finally { setLoading(false); }
  };

  // Company initial
  const companyInitial = (form.companyName || form.name || "R").charAt(0).toUpperCase();

  return (
    <div className="ml-60 flex-1 min-w-0">
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 h-14 border-b"
        style={{ background: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--foreground-dim)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.background = "var(--surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; e.currentTarget.style.background = "transparent"; }}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">Company Profile</h1>
            <p className="text-[0.7rem] mt-0.5" style={{ color: "var(--foreground-dim)" }}>
              Your public employer profile seen by candidates
            </p>
          </div>
        </div>
        <button onClick={save} disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
          style={{ background: "var(--primary)", color: "#fff" }}>
          <Save className="h-3.5 w-3.5" />
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        <form onSubmit={save} className="space-y-6">

          {/* ── Company identity card ─────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Brand banner */}
            <div className="h-24 relative" style={{ background: "linear-gradient(135deg, rgba(13,81,255,0.25) 0%, rgba(13,81,255,0.08) 100%)" }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(13,81,255,0.5) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.4) 0%, transparent 50%)" }} />
            </div>

            {/* Company logo + info */}
            <div className="px-6 pb-6" style={{ background: "var(--surface-2)" }}>
              <div className="flex items-end gap-4 -mt-8 mb-4">
                {/* Large company avatar */}
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-4 shrink-0"
                  style={{ background: "var(--primary)", borderColor: "var(--surface-2)" }}>
                  {companyInitial}
                </div>
                <div className="pb-1 min-w-0">
                  <h2 className="font-bold text-foreground text-lg leading-tight truncate">
                    {form.companyName || "Your Company"}
                  </h2>
                  <p className="text-sm truncate" style={{ color: "var(--foreground-muted)" }}>
                    {form.position ? `${form.position}` : "Add your position"}
                    {form.location && ` · ${form.location}`}
                  </p>
                </div>
              </div>

              {/* Quick info row */}
              <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--foreground-muted)" }}>
                {form.companyWebsite && (
                  <a href={form.companyWebsite} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                    <Globe className="h-3.5 w-3.5" />
                    {form.companyWebsite.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </a>
                )}
                {form.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />{form.location}
                  </span>
                )}
                {form.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />{form.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />{userData?.email}
                </span>
              </div>
            </div>
          </div>

          {/* ── Contact & recruiter info ──────────────────────── */}
          <Section icon={User} title="Recruiter info">
            <Field label="Your Name">
              <input type="text" value={form.name} onChange={set("name")}
                placeholder="Jane Smith" className={iClass} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Your Position / Title">
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                  <input type="text" value={form.position} onChange={set("position")}
                    placeholder="e.g. HR Manager" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
                </div>
              </Field>
              <Field label="Phone Number">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                  <input type="tel" value={form.phone} onChange={set("phone")}
                    placeholder="+91 98765 43210" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
                </div>
              </Field>
            </div>
            <Field label="LinkedIn Profile">
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input type="url" value={form.linkedin} onChange={set("linkedin")}
                  placeholder="https://linkedin.com/in/your-profile" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
              </div>
            </Field>
          </Section>

          {/* ── Company details ───────────────────────────────── */}
          <Section icon={Building2} title="Company details">
            <Field label="Company Name">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input type="text" value={form.companyName} onChange={set("companyName")}
                  placeholder="e.g. Acme Technologies" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Website">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                  <input type="url" value={form.companyWebsite} onChange={set("companyWebsite")}
                    placeholder="https://company.com" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
                </div>
              </Field>
              <Field label="Headquarters">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                  <input type="text" value={form.location} onChange={set("location")}
                    placeholder="e.g. Bangalore, India" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
                </div>
              </Field>
            </div>
            <Field label="About the Company"
              hint="Tell candidates what makes your company a great place to work.">
              <textarea value={form.aboutMe} onChange={set("aboutMe")} rows={5}
                placeholder={`What does your company do?\n\nWhat's the culture like?\n\nWhat can candidates expect?`}
                className={iClass + " resize-none"} style={{ ...iStyle, lineHeight: "1.6" }}
                onFocus={iFocus} onBlur={iBlur} />
            </Field>
          </Section>

          {/* ── Bottom bar ────────────────────────────────────── */}
          <div className="flex items-center justify-between rounded-2xl px-6 py-4"
            style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-dim)" }}>
              Candidates see this profile when they apply to your jobs
            </p>
            <button type="submit" disabled={loading}
              className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg disabled:opacity-40"
              style={{ background: "var(--primary)", color: "#fff" }}>
              <Save className="h-3.5 w-3.5" />
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   JOB SEEKER PROFILE  (unchanged from before)
   ════════════════════════════════════════════════════════════════════════════ */
function JobSeekerProfile({ userData, dispatch }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", experience: "", jobTitle: "", education: "",
    location: "", aboutMe: "", skills: [], projects: [],
    linkedin: "", github: "", portfolio: "",
  });

  useEffect(() => {
    if (userData) {
      setForm({
        name:       userData.name       || "",
        experience: userData.experience || "",
        jobTitle:   userData.jobTitle   || "",
        education:  userData.education  || "",
        location:   userData.location   || "",
        aboutMe:    userData.aboutMe    || "",
        skills:     Array.isArray(userData.skills)   ? userData.skills   : [],
        projects:   Array.isArray(userData.projects) ? userData.projects : [],
        linkedin:   userData.linkedin   || "",
        github:     userData.github     || "",
        portfolio:  userData.portfolio  || "",
      });
    }
  }, [userData]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e?.preventDefault();
    const token = getToken();
    if (!token) { toast.error("Not logged in", TOAST); return; }
    setLoading(true);
    const t = toast.loading("Saving…", TOAST);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/v1/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const updated = { ...userData, ...form };
        dispatch(loginSuccess(updated));
        const stored = JSON.parse(localStorage.getItem("userData") || "{}");
        localStorage.setItem("userData", JSON.stringify({ ...stored, ...form }));
        toast.success("Profile saved!", { id: t, ...TOAST });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save", { id: t, ...TOAST });
    } finally { setLoading(false); }
  };

  const JOB_TITLES = ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Researcher"];
  const companyInitial = (form.name || userData?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="ml-60 flex-1 min-w-0">
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 h-14 border-b"
        style={{ background: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-md transition-colors" style={{ color: "var(--foreground-dim)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.background = "var(--surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; e.currentTarget.style.background = "transparent"; }}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">Profile</h1>
            <p className="text-[0.7rem] mt-0.5" style={{ color: "var(--foreground-dim)" }}>Update your info — it improves your job match scores</p>
          </div>
        </div>
        <button onClick={save} disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
          style={{ background: "var(--primary)", color: "#fff" }}>
          <Save className="h-3.5 w-3.5" />{loading ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-2xl px-6 py-5 mb-8"
          style={{ background: "linear-gradient(135deg, rgba(13,81,255,0.08) 0%, rgba(13,81,255,0.02) 100%)", border: "1px solid rgba(13,81,255,0.15)" }}>
          <div className="h-13 w-13 rounded-2xl flex items-center justify-center font-bold text-white text-xl shrink-0"
            style={{ background: "var(--primary)", width: 52, height: 52 }}>{companyInitial}</div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-base truncate">{form.name || userData?.name || "Your Name"}</p>
            <p className="text-sm mt-0.5 truncate" style={{ color: "var(--foreground-muted)" }}>
              {form.jobTitle || "Add your role"}{form.location && ` · ${form.location}`}
            </p>
            {form.skills.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {form.skills.slice(0, 4).map((s) => (
                  <span key={s} className="text-[0.65rem] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(13,81,255,0.12)", color: "#6B9FFF", border: "1px solid rgba(13,81,255,0.2)" }}>{s}</span>
                ))}
                {form.skills.length > 4 && <span className="text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "var(--foreground-dim)" }}>+{form.skills.length - 4}</span>}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={save} className="space-y-6">
          <Section icon={User} title="Basic info">
            <Field label="Full Name">
              <input type="text" value={form.name} onChange={set("name")} placeholder="Jane Doe" className={iClass} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                  <input type="text" value={form.location} onChange={set("location")} placeholder="e.g. Bangalore" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
                </div>
              </Field>
              <Field label="Years of Experience">
                <input type="text" value={form.experience} onChange={set("experience")} placeholder="e.g. 2, 3–5 years" className={iClass} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
              </Field>
            </div>
            <Field label="Current / Desired Role">
              <div className="flex flex-wrap gap-2">
                {JOB_TITLES.map((t) => (
                  <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, jobTitle: t }))}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: form.jobTitle === t ? "rgba(13,81,255,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${form.jobTitle === t ? "rgba(13,81,255,0.45)" : "rgba(255,255,255,0.09)"}`, color: form.jobTitle === t ? "#6B9FFF" : "var(--foreground-muted)" }}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Education">
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input type="text" value={form.education} onChange={set("education")} placeholder="e.g. B.Tech Computer Science" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
              </div>
            </Field>
            <Field label="About Me">
              <textarea value={form.aboutMe} onChange={set("aboutMe")} rows={4} placeholder="A short bio about yourself…" className={iClass + " resize-none"} style={{ ...iStyle, lineHeight: "1.6" }} onFocus={iFocus} onBlur={iBlur} />
            </Field>
          </Section>

          <Section icon={Briefcase} title="Skills">
            <Field label="Your Skills" hint="Matched against job descriptions to calculate your % match score.">
              <TagInput tags={form.skills} onChange={(skills) => setForm((f) => ({ ...f, skills }))} placeholder="e.g. React, Node.js, Python…" />
            </Field>
          </Section>

          <Section icon={FileText} title="Projects">
            <Field label="Projects" hint="Add notable projects you've worked on.">
              <TagInput tags={form.projects} onChange={(projects) => setForm((f) => ({ ...f, projects }))} placeholder="e.g. E-commerce platform, ML pipeline…" />
            </Field>
          </Section>

          <Section icon={Globe} title="Links">
            <Field label="LinkedIn">
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input type="url" value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/your-username" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
              </div>
            </Field>
            <Field label="GitHub">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input type="url" value={form.github} onChange={set("github")} placeholder="https://github.com/your-username" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
              </div>
            </Field>
            <Field label="Portfolio">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--foreground-dim)" }} />
                <input type="url" value={form.portfolio} onChange={set("portfolio")} placeholder="https://your-portfolio.com" className={iClass + " pl-8"} style={iStyle} onFocus={iFocus} onBlur={iBlur} />
              </div>
            </Field>
          </Section>

          <div className="flex items-center justify-between rounded-2xl px-6 py-4"
            style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs" style={{ color: "var(--foreground-dim)" }}>Changes apply to your match scores immediately</p>
            <button type="submit" disabled={loading}
              className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg disabled:opacity-40"
              style={{ background: "var(--primary)", color: "#fff" }}>
              <Save className="h-3.5 w-3.5" />{loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Root page — role router
   ════════════════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch  = useDispatch();
  const userData  = user || getUserFromLocalStorage();
  const role      = userData?.userRole || "job_seeker";

  return (
    <AuthGuard>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        {role === "recruiter"
          ? <RecruiterProfile userData={userData} dispatch={dispatch} />
          : <JobSeekerProfile userData={userData} dispatch={dispatch} />}
      </div>
    </AuthGuard>
  );
}
