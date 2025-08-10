import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Target, Bot, Users, TrendingUp, FileText } from "lucide-react";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "@/services/authService";

const Hero = ({ darkMode }) => {
  const words = ["Dream Job", "Perfect Match", "Career Growth"];
  const [index, setIndex] = useState(0);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  useEffect(() => {
    if (!user) {
      const localUser = getUserFromLocalStorage();
      setUserData(localUser);
    } else {
      setUserData(user);
    }
  }, [user]);

  // Determine the dashboard button destination based on auth status
  const dashboardHref = (userData || isAuthenticated) ? "/dashboard" : "/login";

  return (
    <section className={`${darkMode ? "bg-gray-900" : "bg-lime-300"} py-20`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 h-24 md:h-28">
            <AnimatePresence mode="wait">
              <motion.span
                key={words[index]}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={darkMode ? "text-white" : "text-black"}
              >
                {words[index]}
              </motion.span>
            </AnimatePresence>
          </h1>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className={darkMode ? "text-white" : "text-gray-800"}>Find Your </span>
            <span className={darkMode ? "text-white" : "text-black"}>Perfect Career Match</span>
          </h1>
          <p className={`mt-3 text-lg sm:text-xl md:text-2xl max-w-3xl ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            TalentAlign centralizes jobs from Telegram and web portals, provides AI-powered skill matching with compatibility percentages, and accelerates your career with personalized cover letters and progress tracking.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className={`px-8 py-3 text-lg font-medium rounded-md shadow ${
                darkMode 
                  ? "bg-white hover:bg-gray-100 text-black" 
                  : "bg-black hover:bg-gray-800 text-white"
              } transition-colors`}
            >
              Find Jobs Now
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={dashboardHref}
              className={`px-8 py-3 text-lg font-medium rounded-md border ${
                darkMode 
                  ? "border-white text-white hover:bg-gray-800" 
                  : "border-black text-black hover:bg-gray-100"
              } transition-colors`}
            >
              View Dashboard
            </motion.a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className={`flex flex-col items-center p-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white shadow-md"
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}>
                <Search size={24} />
              </div>
              <span className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Smart Job Search</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className={`flex flex-col items-center p-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white shadow-md"
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}>
                <Target size={24} />
              </div>
              <span className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>Skill Matching</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className={`flex flex-col items-center p-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white shadow-md"
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}`}>
                <Bot size={24} />
              </div>
              <span className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>AI Cover Letters</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;