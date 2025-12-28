"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, setHydrated } from "@/redux/slices/authSlice";
import { getUserFromLocalStorage } from "@/services/authService";

/**
 * AuthHydration component
 * Hydrates Redux auth state from localStorage on app initialization
 * Prevents logout on page refresh
 */
export default function AuthHydration({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const userData = getUserFromLocalStorage();

      if (userData) {
        console.log('Hydrating auth state from localStorage:', userData);
        dispatch(loginSuccess(userData));
      } else {
        console.log('No user data found in localStorage');
        // Still mark as hydrated even if no user
        dispatch(setHydrated());
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}
