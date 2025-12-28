"use client";

import Navbar from "@/components/components/Navbar";
import Hero from "@/components/components/Hero";
import HowItWorks from "@/components/components/HowItWorks";
import WhyChooseUs from "@/components/components/WhyChooseUs";
import PlatformStats from "@/components/components/ContactForm";
import Footer from "@/components/components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <PlatformStats />
      <Footer />
    </div>
  );
}
