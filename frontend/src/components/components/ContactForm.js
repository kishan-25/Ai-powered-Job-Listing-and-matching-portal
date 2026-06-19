"use client";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", inquiryType: "General", message: "" });
  const [status, setStatus] = useState(null); // "sending" | "ok" | "error"

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(`${API_BASE_URL}/api/v1/contact`, form);
      setStatus("ok");
      setForm({ name: "", email: "", subject: "", inquiryType: "General", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-20 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold text-foreground-dim uppercase tracking-widest mb-3">Contact</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Get in touch</h2>
        <p className="text-foreground-muted text-sm mb-10">Have a question or feedback? We read every message.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <input className="search-input" placeholder="Your name" value={form.name} onChange={set("name")} required />
          <input className="search-input" type="email" placeholder="Email address" value={form.email} onChange={set("email")} required />
          <input className="search-input sm:col-span-2" placeholder="Subject" value={form.subject} onChange={set("subject")} required />
          <select className="search-input" value={form.inquiryType} onChange={set("inquiryType")}>
            {["General", "Bug Report", "Feature Request", "Partnership"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <textarea
            className="search-input sm:col-span-2 resize-none h-28"
            placeholder="Your message"
            value={form.message}
            onChange={set("message")}
            required
          />

          <div className="sm:col-span-2 flex items-center gap-4">
            <button type="submit" disabled={status === "sending"} className="btn-primary">
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            {status === "ok" && <span className="text-success text-sm">Message sent ✓</span>}
            {status === "error" && <span className="text-error text-sm">Failed — please try again.</span>}
          </div>
        </form>
      </div>
    </section>
  );
}
