// Improved AuthGuard.js
"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
    const { user, isAuthenticated, hydrated } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        // Wait for hydration to complete
        if (!hydrated) {
            return;
        }

        // After hydration, check if user is authenticated
        if (!user || !isAuthenticated) {
            router.push("/");
        }
    }, [user, isAuthenticated, hydrated, router]);

    // Wait for hydration before showing anything
    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show content only if user is authenticated
    return (user && isAuthenticated) ? children : null;
}