"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/redux/slices/authSlice";
import { loginUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const dispatch = useDispatch();
  const router   = useRouter();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const data = await loginUser({ email, password });
      if (data.success) {
        dispatch(loginSuccess(data));
        toast.success("Welcome back!");
        const role = data.userRole || "job_seeker";
        router.push(role === "admin" ? "/admin" : role === "recruiter" ? "/recruiter" : "/dashboard");
      } else {
        dispatch(loginFailure(data.message));
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      dispatch(loginFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-center" toastOptions={{ style: { background: "#252219", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" } }} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs leading-none">T</span>
          </div>
          <span className="font-bold text-foreground text-sm">TalentAlign</span>
        </Link>
        <Link href="/register" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
          Create account →
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-foreground-muted text-sm mb-8">Sign in to your TalentAlign account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="search-input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="search-input pr-10"
                  required
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-foreground-muted mt-6">
            No account?{" "}
            <Link href="/register" className="text-foreground hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
