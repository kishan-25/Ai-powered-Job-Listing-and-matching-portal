"use client";
import Navbar from "@/components/components/Navbar";
import Hero from "@/components/components/Hero";
import HowItWorks from "@/components/components/HowItWorks";
import WhyChooseUs from "@/components/components/WhyChooseUs";
import ContactForm from "@/components/components/ContactForm";
import Footer from "@/components/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto">
        <Hero />
      </main>
      <div className="max-w-4xl mx-auto">
        <HowItWorks />
        <WhyChooseUs />
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
