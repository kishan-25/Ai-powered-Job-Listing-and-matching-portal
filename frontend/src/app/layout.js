import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/redux/Provider";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
