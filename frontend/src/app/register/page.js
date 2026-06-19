"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import { registerUser } from "@/services/authService";
import { parseResume } from "@/services/resumeService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Briefcase, Building2, Check, ChevronLeft, Upload, X, Eye, EyeOff } from "lucide-react";

const TOAST = { style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } };

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    userRole: "", name: "", email: "", password: "", confirmPassword: "",
    skills: [], experience: "", location: "",
    companyName: "", companyWebsite: "", phone: "", position: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading]       = useState(false);
  const [parsing, setParsing]       = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [showPw, setShowPw]         = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const dispatch = useDispatch();
  const router   = useRouter();
  const { user, isAuthenticated, hydrated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (hydrated && isAuthenticated && user) {
      router.push(user.userRole === "admin" ? "/admin" : user.userRole === "recruiter" ? "/recruiter" : "/dashboard");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || (isAuthenticated && user)) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="spinner h-8 w-8" /></div>;
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addSkill = (e) => {
    e?.preventDefault();
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  const handleResume = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      toast.error("Please upload a PDF or Word document", TOAST);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5 MB", TOAST); return; }
    setResumeFile(file);
    setParsing(true);
    const t = toast.loading("Parsing resume…", TOAST);
    try {
      const result = await parseResume(file);
      if (result && (result.success || result.skills)) {
        const extracted = result.skills || [];
        if (extracted.length) {
          setForm((f) => ({
            ...f,
            skills: extracted,
            experience: result.yearOfExperience?.toString() || f.experience,
            location: result.location || f.location,
          }));
          toast.success(`Extracted ${extracted.length} skills`, { id: t, ...TOAST });
        } else {
          toast.error("No skills found — fill manually", { id: t, ...TOAST });
        }
      } else {
        toast.error(result?.message || "Parse failed", { id: t, ...TOAST });
      }
    } catch {
      toast.error("Parse failed — fill manually", { id: t, ...TOAST });
    } finally {
      setParsing(false);
    }
  };

  const validate = () => {
    if (step === 1 && !form.userRole) { toast.error("Choose a role", TOAST); return false; }
    if (step === 2) {
      if (!form.name.trim()) { toast.error("Name required", TOAST); return false; }
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { toast.error("Valid email required", TOAST); return false; }
      if (form.password.length < 8) { toast.error("Min 8 characters", TOAST); return false; }
      if (form.password !== form.confirmPassword) { toast.error("Passwords don't match", TOAST); return false; }
    }
    if (step === 3 && form.userRole === "recruiter") {
      if (!form.companyName.trim()) { toast.error("Company name required", TOAST); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, 3)); };
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) { next(); return; }
    if (!validate()) return;
    setLoading(true);
    const t = toast.loading("Creating account…", TOAST);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password, userRole: form.userRole,
        ...(form.userRole === "job_seeker"
          ? { skills: form.skills, experience: form.experience || "0", location: form.location }
          : { companyName: form.companyName, companyWebsite: form.companyWebsite, phone: form.phone, position: form.position }),
      };
      const data = await registerUser(payload);
      if (data.success) {
        toast.success("Account created!", { id: t, ...TOAST });
        dispatch(loginSuccess(data));
        router.push(form.userRole === "recruiter" ? "/recruiter" : "/dashboard");
      } else {
        toast.error(data.message || "Registration failed", { id: t, ...TOAST });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "An error occurred";
      toast.error(msg.toLowerCase().includes("already exists") ? "Email already registered — sign in instead" : msg, { id: t, ...TOAST });
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicators ────────────────────────────────────────────────────────
  const STEPS = ["Role", "Account", form.userRole === "recruiter" ? "Company" : "Profile"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs leading-none">T</span>
          </div>
          <span className="font-bold text-foreground text-sm">TalentAlign</span>
        </Link>
        <Link href="/login" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
          Already registered? Sign in →
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center pt-12 px-4 pb-16">
        <div className="w-full max-w-md">

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    done ? "bg-primary text-white" : active ? "bg-primary text-white" : "bg-surface-2 text-foreground-dim border border-border"
                  }`}>
                    {done ? <Check className="h-3 w-3" /> : n}
                  </div>
                  <span className={`text-xs font-medium ${active || done ? "text-foreground" : "text-foreground-dim"}`}>{label}</span>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border ml-1" />}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Step 1 — Role */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Choose your role</h2>
                  <p className="text-foreground-muted text-sm mt-1">How will you use TalentAlign?</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { role: "job_seeker", label: "Job Seeker", icon: Briefcase, desc: "Find and apply to jobs" },
                    { role: "recruiter",  label: "Recruiter",  icon: Building2, desc: "Post jobs and hire talent" },
                  ].map(({ role, label, icon: Icon, desc }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setForm((f) => ({ ...f, userRole: role })); setStep(2); }}
                      className={`p-5 rounded-lg border text-left transition-all ${
                        form.userRole === role
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface-2 hover:border-foreground-dim"
                      }`}
                    >
                      <Icon className="h-5 w-5 text-foreground-muted mb-3" />
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <p className="text-foreground-muted text-xs mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Account */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Create account</h2>
                  <p className="text-foreground-muted text-sm mt-1">Your login details</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">Full name</label>
                  <input className="search-input" placeholder="Jane Doe" value={form.name} onChange={set("name")} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">Email</label>
                  <input type="email" className="search-input" placeholder="jane@example.com" value={form.email} onChange={set("email")} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">
                    Password <span className="text-foreground-dim">(min 8 chars)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      className="search-input pr-10"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={set("password")}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-dim hover:text-foreground transition-colors"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      className="search-input pr-10"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={set("confirmPassword")}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-dim hover:text-foreground transition-colors"
                      aria-label={showConfirmPw ? "Hide password" : "Show password"}
                    >
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Job seeker profile */}
            {step === 3 && form.userRole === "job_seeker" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Your profile</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Upload your resume and we&apos;ll fill in your skills automatically
                  </p>
                </div>

                {/* ── Resume upload ── */}
                <div>
                  {!resumeFile ? (
                    /* Drop zone — pre-upload */
                    <label
                      className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all group"
                      style={{
                        border: "2px dashed rgba(255,255,255,0.12)",
                        background: "var(--surface-2)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(13,81,255,0.5)"; e.currentTarget.style.background = "rgba(13,81,255,0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "var(--surface-2)"; }}
                    >
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: "rgba(13,81,255,0.1)" }}>
                        <Upload className="h-5 w-5" style={{ color: "var(--primary)" }} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Upload your resume</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                          PDF or Word · max 5 MB · skills auto-extracted
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                        style={{ background: "var(--primary)", color: "#fff" }}>
                        Choose file
                      </span>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResume} disabled={parsing} className="hidden" />
                    </label>
                  ) : parsing ? (
                    /* Parsing state */
                    <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl"
                      style={{ border: "2px solid rgba(13,81,255,0.3)", background: "rgba(13,81,255,0.05)" }}>
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(13,81,255,0.15)" }}>
                        <div className="spinner h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Reading your resume…</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                          Extracting skills, experience & location
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Success state — file parsed */
                    <div className="rounded-xl p-4"
                      style={{ border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.06)" }}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(16,185,129,0.15)" }}>
                          <Check className="h-4 w-4" style={{ color: "#34D399" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{resumeFile.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#34D399" }}>
                            {form.skills.length > 0
                              ? `✓ ${form.skills.length} skills extracted — review below`
                              : "Parsed — add skills manually below"}
                          </p>
                        </div>
                        <label className="text-xs font-medium cursor-pointer transition-colors shrink-0"
                          style={{ color: "var(--foreground-muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--foreground-muted)"; }}>
                          Change
                          <input type="file" accept=".pdf,.doc,.docx" onChange={handleResume} className="hidden" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--foreground-dim)" }}>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                  {resumeFile && !parsing ? "Review & edit extracted info" : "Or fill in manually"}
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-wide"
                    style={{ color: "var(--foreground-muted)" }}>
                    Skills
                    {form.skills.length > 0 && (
                      <span className="ml-2 font-normal" style={{ color: "var(--foreground-dim)" }}>
                        {form.skills.length} added
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="search-input flex-1"
                      placeholder="e.g. React, Python, AWS…"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    />
                    <button type="button" onClick={addSkill} className="btn-outline px-4 text-xs">Add</button>
                  </div>
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.skills.map((s) => (
                        <span key={s}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(13,81,255,0.12)", color: "#6B9FFF", border: "1px solid rgba(13,81,255,0.2)" }}>
                          {s}
                          <button type="button" onClick={() => removeSkill(s)}
                            className="transition-colors hover:text-white ml-0.5">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                      Years of experience
                    </label>
                    <input type="number" min="0" className="search-input" placeholder="e.g. 2"
                      value={form.experience} onChange={set("experience")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--foreground-muted)" }}>
                      Location
                    </label>
                    <input className="search-input" placeholder="e.g. Bangalore"
                      value={form.location} onChange={set("location")} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Recruiter */}
            {step === 3 && form.userRole === "recruiter" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Company info</h2>
                  <p className="text-foreground-muted text-sm mt-1">Tell us about your company</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">Company name *</label>
                  <input className="search-input" placeholder="Acme Inc." value={form.companyName} onChange={set("companyName")} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">Company website</label>
                  <input type="url" className="search-input" placeholder="https://acme.com" value={form.companyWebsite} onChange={set("companyWebsite")} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">Phone number *</label>
                  <input type="tel" className="search-input" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground-muted mb-1.5">Your position</label>
                  <input className="search-input" placeholder="HR Manager" value={form.position} onChange={set("position")} />
                </div>
              </div>
            )}

            {/* Nav buttons */}
            {step > 1 && (
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={prev} className="btn-outline flex items-center gap-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
                {step < 3 ? (
                  <button type="button" onClick={next} className="btn-primary flex-1">Continue</button>
                ) : (
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? "Creating…" : "Create account"}
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
