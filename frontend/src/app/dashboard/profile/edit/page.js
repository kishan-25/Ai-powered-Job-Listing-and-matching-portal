"use client";
// Canonical profile edit is now at /profile (consistent with recruiter sidebar link).
// Redirect there so old bookmark URLs still work.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/profile"); }, [router]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="spinner h-7 w-7" />
    </div>
  );
}
