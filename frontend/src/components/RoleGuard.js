"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

/**
 * RoleGuard Component
 * Protects routes based on user role
 *
 * Usage:
 * <RoleGuard allowedRoles={['admin', 'recruiter']}>
 *   <YourProtectedComponent />
 * </RoleGuard>
 */
export default function RoleGuard({ children, allowedRoles = [], redirectTo = "/login" }) {
    const router = useRouter();
    const { user, isAuthenticated, hydrated } = useSelector((state) => state.auth);

    useEffect(() => {
        // Wait for hydration to complete before checking auth
        if (!hydrated) {
            console.log("RoleGuard: Waiting for auth hydration...");
            return;
        }

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            console.log("RoleGuard: User not authenticated, redirecting to login");
            router.push(redirectTo);
            return;
        }

        // Check if account is suspended
        if (user.accountStatus === 'suspended') {
            console.log("RoleGuard: Account suspended");
            router.push("/suspended");
            return;
        }

        // Check if user has required role
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.userRole)) {
            console.log(`RoleGuard: User role '${user.userRole}' not in allowed roles [${allowedRoles.join(', ')}]`);

            // Redirect based on actual user role
            switch (user.userRole) {
                case 'admin':
                    router.push("/admin");
                    break;
                case 'recruiter':
                    router.push("/recruiter");
                    break;
                case 'job_seeker':
                default:
                    router.push("/dashboard");
                    break;
            }
        }
    }, [isAuthenticated, user, allowedRoles, router, redirectTo, hydrated]);

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

    // If not authenticated or wrong role, don't render children
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
                    <p className="text-gray-600 mb-4">
                        {user.suspensionReason || "Your account has been suspended. Please contact support for assistance."}
                    </p>
                    <button
                        onClick={() => router.push("/contact")}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                    >
                        Contact Support
                    </button>
                </div>
            </div>
        );
    }

    // Check role authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.userRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    // User is authenticated and authorized
    return <>{children}</>;
}
