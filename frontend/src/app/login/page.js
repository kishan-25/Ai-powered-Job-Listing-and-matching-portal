"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/redux/slices/authSlice";
import { loginUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast, ToastContainer } from "@/components/Toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const router = useRouter();
    const { loading, error } = useSelector((state) => state.auth);
    const { toasts, removeToast, showSuccess, showError } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const data = await loginUser({ email, password });
            if (data.success) {
                dispatch(loginSuccess(data));
                showSuccess("Login successful! Redirecting to dashboard...");
                router.push("/dashboard");
            } else {
                dispatch(loginFailure(data.message || "Login failed"));
                showError(data.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            dispatch(loginFailure(error.response?.data?.message || "Login failed"));
            showError(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white text-black rounded-xl shadow-lg p-8 border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-lime-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-black font-bold text-xl">T</span>
                    </div>
                    <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your TalentAlign account</p>
                </div>
            

            
                <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-black mb-2">Email Address</label>
                    <input 
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-black mb-2">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-300 focus:border-lime-300 transition-colors"
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-semibold"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                </form>
            
            <div className="mt-8 text-center">
                <p className="text-gray-600">
                    Don&apos;t have an account? <Link href="/register" className="text-black hover:text-gray-700 font-semibold">Create one here</Link>
                </p>
            </div>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
    );
}