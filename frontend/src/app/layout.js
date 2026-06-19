import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/redux/Provider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "TalentAlign — AI Job Matching",
  description: "AI-powered job matching. Find your next role at the fastest growing startups.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Providers>
          {children}
          {/* Global toast container — available on every page including sidebar logout */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#252219",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "0.875rem",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
