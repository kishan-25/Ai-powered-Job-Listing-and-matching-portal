"use client";
import { Zap, Globe, Brain, ShieldCheck } from "lucide-react";

const FEATURES = [
  { icon: Brain,       title: "AI-powered matching",   desc: "Skill-based compatibility scores for every single job listing." },
  { icon: Globe,       title: "Aggregated sources",    desc: "Telegram channels, HireJobs, TimesJobs — one clean feed." },
  { icon: Zap,         title: "Instant cover letters", desc: "Gemini AI writes them. You review, edit, send." },
  { icon: ShieldCheck, title: "Privacy first",         desc: "Your resume data stays yours. No selling, no sharing." },
];

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-20 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-3">Why us</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12">Built differently</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="spotlight-card">
              <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center mb-3">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm mb-1.5">{title}</p>
              <p className="text-foreground-muted text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
