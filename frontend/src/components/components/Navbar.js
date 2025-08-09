"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage, removeUserFromLocalStorage } from "@/services/authService";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { logout } from "@/redux/slices/authSlice";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      const localUser = getUserFromLocalStorage();
      setUserData(localUser);
    } else {
      setUserData(user);
    }
  }, [user]);

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
    <nav className={`sticky top-0 z-50 ${darkMode ? "bg-gray-800 text-white" : "bg-lime-300 text-black"} shadow-md`}>
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-lime-500" : "bg-black"}`}>
                <span className={`font-bold ${darkMode ? "text-black" : "text-white"}`}>T</span>
                </div>
                <span className="text-xl font-bold">TalentAlign</span>
              </Link>
            </motion.div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Platform Dropdown */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center space-x-1 ${darkMode ? "hover:text-gray-300" : "hover:text-gray-600"} transition-colors`}
              >
                <span>Platform</span>
                <ChevronDown size={16} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg ${
                    darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                  } z-50`}
                >
                  <div className="py-1">
                    <Link
                      href="/#how-it-works"
                      className={`block px-4 py-2 text-sm ${
                        darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"
                      } transition-colors`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      How It Works
                    </Link>
                    <Link
                      href="/#why-choose-us"
                      className={`block px-4 py-2 text-sm ${
                        darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"
                      } transition-colors`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      Features
                    </Link>
                    <Link
                      href="/#platform-stats"
                      className={`block px-4 py-2 text-sm ${
                        darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-800"
                      } transition-colors`}
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
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            
            {/* Authentication Links */}
            {userData || isAuthenticated ? (
              <>
                <span className="text-sm">Hello, {userData?.name?.split(" ")[0] || "User"}</span>
                <Link href="/dashboard" className={`px-3 py-2 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}>
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" className={`px-3 py-2 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}>
                  Profile
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/login" className={`px-3 py-2 rounded-md ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}>
                  Login
                </Link>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/register"
                  className={`px-4 py-2 rounded-md ${
                    darkMode 
                      ? "bg-white hover:bg-gray-100 text-black" 
                      : "bg-black hover:bg-gray-800 text-white"
                  } transition-colors`}
                >
                  Sign Up
                </motion.a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 mr-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
          className={`md:hidden ${darkMode ? "bg-gray-800" : "bg-lime-300"} shadow-lg`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/#how-it-works" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              onClick={toggleMobileMenu}
            >
              How It Works
            </Link>
            <Link 
              href="/#why-choose-us" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              onClick={toggleMobileMenu}
            >
              Features
            </Link>
            <Link 
              href="/#platform-stats" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              onClick={toggleMobileMenu}
            >
              Platform Stats
            </Link>

            
            {/* Mobile Authentication Links */}
            {userData || isAuthenticated ? (
              <>
                <div className="px-3 py-2 font-medium text-sm">
                  Hello, {userData?.name?.split(" ")[0] || "User"}
                </div>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  onClick={toggleMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  onClick={toggleMobileMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  onClick={toggleMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    darkMode 
                      ? "bg-white hover:bg-gray-100 text-black" 
                      : "bg-black hover:bg-gray-800 text-white"
                  }`}
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