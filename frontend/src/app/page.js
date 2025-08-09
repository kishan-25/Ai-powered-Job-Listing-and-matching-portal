"use client";

import { useState } from "react";
import Navbar from "@/components/components/Navbar";
import Hero from "@/components/components/Hero";
import HowItWorks from "@/components/components/HowItWorks";
import WhyChooseUs from "@/components/components/WhyChooseUs";

import PlatformStats from "@/components/components/ContactForm";
import Footer from "@/components/components/Footer";

export default function Home(){
  
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Hero darkMode={darkMode} />
      <HowItWorks darkMode={darkMode} />
      <WhyChooseUs darkMode={darkMode} />

      <PlatformStats darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
};
