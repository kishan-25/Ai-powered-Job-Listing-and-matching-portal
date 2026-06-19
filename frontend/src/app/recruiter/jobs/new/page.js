"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { Sidebar } from "@/components/ui/Sidebar";
import { createJob } from "@/services/recruiterService";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft, Save, Send, X, Plus,
  Briefcase, MapPin, DollarSign, Clock, Wifi, Building2,
} from "lucide-react";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

/* ─── Reusable field wrapper ─────────────────────────────────────────────── */
function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold tracking-wide"
        style={{ color: "var(--foreground-muted)" }}>
        {label}
        {required && <span style={{ color: "var(--error)" }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-[0.7rem]" style={{ color: "var(--foreground-dim)" }}>{hint}</p>}
    </div>
  );
}

/* ─── Shared input style ─────────────────────────────────────────────────── */
const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-colors";
const inputStyle = {
  background: "var(--surface-2)",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "var(--foreground)",
};
function onFocus(e) { e.target.style.borderColor = "rgba(13,81,255,0.5)"; }
function onBlur(e)  { e.target.style.borderColor = "rgba(255,255,255,0.09)"; }

/* ─── Toggle option group (replaces select) ──────────────────────────────── */
function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-lg transition-all"
            style={{
              background: active ? "rgba(13,81,255,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${active ? "rgba(13,81,255,0.5)" : "rgba(255,255,255,0.09)"}`,
              color: active ? "#6B9FFF" : "var(--foreground-muted)",
            }}
          >
            {opt.icon && <opt.icon className="h-3.5 w-3.5" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Skill tag input ────────────────────────────────────────────────────── */
function SkillInput({ skills, onChange }) {
  const [input, setInput] = useState("");

  const add = () => {
    const s = input.trim();
    if (s && !skills.includes(s)) { onChange([...skills, s]); }
    setInput("");
  };
  const remove = (s) => onChange(skills.filter((x) => x !== s));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="e.g. React, Node.js, AWS…"
          className={inputClass + " flex-1"}
          style={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button type="button" onClick={add}
          className="flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground-muted)" }}>
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span key={s}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(13,81,255,0.12)", color: "#6B9FFF", border: "1px solid rgba(13,81,255,0.2)" }}>
              {s}
              <button type="button" onClick={() => remove(s)}
                className="transition-colors hover:text-white ml-0.5"
                aria-label={`Remove ${s}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Section divider ────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <p className="text-[0.67rem] font-bold uppercase tracking-widest"
        style={{ color: "var(--foreground-dim)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function NewJobPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    keySkills: [],       // array — displayed as tags
    location: "",
    experience: "",
    salary: "",
    jobType: "Full-time",
    workMode: "On-site",
    expiresAt: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSkills = (skills) => setForm((f) => ({ ...f, keySkills: skills }));

  const submit = async (status) => {
    if (!form.title.trim()) { toast.error("Job title is required", TOAST); return; }
    if (!form.company.trim()) { toast.error("Company name is required", TOAST); return; }
    if (!form.description.trim() || form.description.length < 30) {
      toast.error("Please add a description (min 30 characters)", TOAST);
      return;
    }

    setLoading(true);
    const t = toast.loading(status === "active" ? "Publishing job…" : "Saving draft…", TOAST);
    try {
      const res = await createJob({ ...form, status });
      if (res.success) {
        toast.success(
          status === "active" ? "Job published! Candidates can now see it." : "Draft saved.",
          { id: t, ...TOAST }
        );
        router.push("/recruiter");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create job", { id: t, ...TOAST });
    } finally {
      setLoading(false);
    }
  };

  const JOB_TYPES = [
    { value: "Full-time", label: "Full-time",  icon: Briefcase },
    { value: "Part-time", label: "Part-time",  icon: Clock },
    { value: "Contract",  label: "Contract",   icon: Clock },
    { value: "Internship",label: "Internship", icon: Briefcase },
  ];
  const WORK_MODES = [
    { value: "Remote",  label: "Remote",   icon: Wifi },
    { value: "Hybrid",  label: "Hybrid",   icon: Wifi },
    { value: "On-site", label: "On-site",  icon: Building2 },
  ];

  // Char count for description
  const descLen = form.description.length;

  return (
    <RoleGuard allowedRoles={["recruiter"]}>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-background flex">
        <Sidebar />

        <div className="ml-60 flex-1 min-w-0">

          {/* ── Top bar ───────────────────────────────────────────── */}
          <div
            className="sticky top-0 z-30 flex items-center justify-between px-8 h-14 border-b"
            style={{ background: "var(--background)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3">
              <Link href="/recruiter"
                className="p-1.5 rounded-md transition-colors"
                style={{ color: "var(--foreground-dim)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; e.currentTarget.style.background = "transparent"; }}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-none">Post a Job</h1>
                <p className="text-[0.7rem] mt-0.5" style={{ color: "var(--foreground-dim)" }}>
                  Fill in the details — you can save as draft any time
                </p>
              </div>
            </div>

            {/* Action buttons in top bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => submit("draft")}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground-muted)" }}>
                <Save className="h-3.5 w-3.5" />
                Save draft
              </button>
              <button
                type="button"
                onClick={() => submit("active")}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
                style={{ background: "var(--primary)", color: "#fff" }}>
                <Send className="h-3.5 w-3.5" />
                {loading ? "Publishing…" : "Publish Job"}
              </button>
            </div>
          </div>

          {/* ── Form body ─────────────────────────────────────────── */}
          <div className="max-w-2xl mx-auto px-8 py-8">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-8"
            >

              {/* ── Basic details ──────────────────────────────────── */}
              <Section title="Basic details">
                <div
                  className="rounded-2xl p-6 space-y-5"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Field label="Job Title" required>
                    <input
                      type="text"
                      value={form.title}
                      onChange={set("title")}
                      placeholder="e.g. Senior Software Engineer"
                      className={inputClass}
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </Field>

                  <Field label="Company Name" required>
                    <input
                      type="text"
                      value={form.company}
                      onChange={set("company")}
                      placeholder="e.g. Acme Corp"
                      className={inputClass}
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Location">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                          style={{ color: "var(--foreground-dim)" }} />
                        <input
                          type="text"
                          value={form.location}
                          onChange={set("location")}
                          placeholder="e.g. Bangalore, India"
                          className={inputClass + " pl-8"}
                          style={inputStyle}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                      </div>
                    </Field>

                    <Field label="Salary Range">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                          style={{ color: "var(--foreground-dim)" }} />
                        <input
                          type="text"
                          value={form.salary}
                          onChange={set("salary")}
                          placeholder="e.g. ₹12–18 LPA"
                          className={inputClass + " pl-8"}
                          style={inputStyle}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                      </div>
                    </Field>
                  </div>

                  <Field label="Experience Required">
                    <input
                      type="text"
                      value={form.experience}
                      onChange={set("experience")}
                      placeholder="e.g. 2–4 years, Fresher, 0–1 year"
                      className={inputClass}
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </Field>
                </div>
              </Section>

              {/* ── Job type & work mode ───────────────────────────── */}
              <Section title="Type & workplace">
                <div
                  className="rounded-2xl p-6 space-y-5"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Field label="Job Type">
                    <ToggleGroup options={JOB_TYPES} value={form.jobType} onChange={(v) => setForm((f) => ({ ...f, jobType: v }))} />
                  </Field>

                  <Field label="Work Mode">
                    <ToggleGroup options={WORK_MODES} value={form.workMode} onChange={(v) => setForm((f) => ({ ...f, workMode: v }))} />
                  </Field>

                  <Field label="Application Deadline" hint="Optional — leave blank if the listing stays open">
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={set("expiresAt")}
                      min={new Date().toISOString().split("T")[0]}
                      className={inputClass}
                      style={{ ...inputStyle, colorScheme: "dark" }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </Field>
                </div>
              </Section>

              {/* ── Skills ────────────────────────────────────────── */}
              <Section title="Required skills">
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Field
                    label="Key Skills"
                    hint="Press Enter or click Add after each skill. These are used for AI candidate matching."
                  >
                    <SkillInput skills={form.keySkills} onChange={setSkills} />
                  </Field>
                </div>
              </Section>

              {/* ── Description ───────────────────────────────────── */}
              <Section title="Job description">
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Field
                    label="Description"
                    required
                    hint="Describe responsibilities, requirements, team, and perks. Markdown formatting supported."
                  >
                    <div className="relative">
                      <textarea
                        value={form.description}
                        onChange={set("description")}
                        rows={12}
                        placeholder={`What will the candidate be doing?\n\nResponsibilities:\n- ...\n\nRequirements:\n- ...\n\nNice to have:\n- ...`}
                        className={inputClass + " resize-none"}
                        style={{ ...inputStyle, lineHeight: "1.6" }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <span
                        className="absolute bottom-3 right-3 text-[0.67rem]"
                        style={{ color: descLen < 30 ? "var(--error)" : "var(--foreground-dim)" }}
                      >
                        {descLen} chars{descLen < 30 ? ` (min 30)` : ""}
                      </span>
                    </div>
                  </Field>
                </div>
              </Section>

              {/* ── Bottom action bar ─────────────────────────────── */}
              <div
                className="flex items-center justify-between rounded-2xl px-6 py-4"
                style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <button
                  type="button"
                  onClick={() => router.push("/recruiter")}
                  className="text-sm transition-colors"
                  style={{ color: "var(--foreground-dim)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-dim)"; }}
                >
                  ← Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => submit("draft")}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground-muted)" }}>
                    <Save className="h-3.5 w-3.5" />
                    Save as draft
                  </button>

                  <button
                    type="button"
                    onClick={() => submit("active")}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-40"
                    style={{ background: "var(--primary)", color: "#fff" }}>
                    <Send className="h-3.5 w-3.5" />
                    {loading ? "Publishing…" : "Publish Job"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
