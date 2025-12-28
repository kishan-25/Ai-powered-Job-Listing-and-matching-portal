"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage, removeUserFromLocalStorage } from "@/services/authService";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, LogOut, ChevronDown, Sun, Moon } from "lucide-react";
import { logout } from "@/redux/slices/authSlice";

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      const localUser = getUserFromLocalStorage();
      setUserData(localUser);
    } else {
      setUserData(user);
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light');
    }
  }, [user]);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    if (!isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    // Remove user from localStorage
    removeUserFromLocalStorage();
    // Update Redux state
    dispatch(logout());
    // Redirect to home page
    setTimeout(() => {
      router.push("/");
    }, 100);
    // Close mobile menu if open
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  if (!isClient) return null; // Prevent SSR mismatch

  return (
    <nav className="sticky top-0 z-50 bg-card text-foreground border-b border-border shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                <span className="font-bold text-white">T</span>
                </div>
                <span className="text-xl font-bold text-foreground">TalentAlign</span>
              </Link>
            </motion.div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Platform Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 text-foreground hover:text-muted-foreground transition-colors"
              >
                <span>Platform</span>
                <ChevronDown size={16} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border z-50"
                >
                  <div className="py-1">
                    <Link
                      href="/#how-it-works"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      How It Works
                    </Link>
                    <Link
                      href="/#why-choose-us"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Features
                    </Link>
                    <Link
                      href="/#platform-stats"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Platform Stats
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-full text-foreground hover:bg-muted"
              aria-label="Toggle theme"
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            {/* Authentication Links */}
            {userData || isAuthenticated ? (
              <>
                <span className="text-sm text-foreground">Hello, {userData?.name?.split(" ")[0] || "User"}</span>
                <Link
                  href={
                    userData?.userRole === 'admin' ? '/admin' :
                    userData?.userRole === 'recruiter' ? '/recruiter' :
                    '/dashboard'
                  }
                  className="px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md bg-error hover:bg-error/80 text-white transition-colors"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-md text-foreground hover:bg-muted transition-colors">
                  Login
                </Link>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/register"
                  className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground transition-colors"
                >
                  Sign Up
                </motion.a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-full text-foreground hover:bg-muted"
              aria-label="Toggle theme"
            >
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded="false"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-card border-b border-border shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
              onClick={toggleMobileMenu}
            >
              How It Works
            </Link>
            <Link
              href="/#why-choose-us"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
              onClick={toggleMobileMenu}
            >
              Features
            </Link>
            <Link
              href="/#platform-stats"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
              onClick={toggleMobileMenu}
            >
              Platform Stats
            </Link>

            
            {/* Mobile Authentication Links */}
            {userData || isAuthenticated ? (
              <>
                <div className="px-3 py-2 font-medium text-sm text-foreground">
                  Hello, {userData?.name?.split(" ")[0] || "User"}
                </div>
                <Link
                  href={
                    userData?.userRole === 'admin' ? '/admin' :
                    userData?.userRole === 'recruiter' ? '/recruiter' :
                    '/dashboard'
                  }
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                  onClick={toggleMobileMenu}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium bg-error hover:bg-error/80 text-white"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={toggleMobileMenu}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;