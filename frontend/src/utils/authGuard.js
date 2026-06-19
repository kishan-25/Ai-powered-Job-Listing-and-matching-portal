"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }) {
  const { user, isAuthenticated, hydrated } = useSelector((s) => s.auth);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !hydrated) return;
    if (!user || !isAuthenticated) router.push("/");
  }, [mounted, hydrated, user, isAuthenticated, router]);

  // Same shell on server and client — no hydration mismatch
  if (!mounted || !hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner h-8 w-8" />
      </div>
    );
  }

  return (user && isAuthenticated) ? <>{children}</> : null;
}
