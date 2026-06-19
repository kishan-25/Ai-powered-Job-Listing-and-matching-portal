"use client";
import { Upload, Target, FileText, Send } from "lucide-react";

const STEPS = [
  { n: "01", icon: Upload,   title: "Upload your resume",    desc: "We extract your skills automatically — no manual entry needed." },
  { n: "02", icon: Target,   title: "Browse matched jobs",   desc: "Every listing gets a match % based on your skills vs the job requirements." },
  { n: "03", icon: FileText, title: "Generate a cover letter", desc: "One click. Tailored to the role and company, sounds like you wrote it." },
  { n: "04", icon: Send,     title: "Apply & track",         desc: "Apply directly. Track every application in your dashboard." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-3">Process</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12">How TalentAlign works</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {STEPS.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="flex gap-4">
              <div className="shrink-0 h-9 w-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
                <Icon className="h-4 w-4 text-foreground-muted" />
              </div>
              <div>
                <p className="text-[0.7rem] text-foreground-dim font-mono mb-1">{n}</p>
                <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                <p className="text-foreground-muted text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
