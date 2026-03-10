import "./globals.css";

import AuthGate from "@/components/AuthGate";
import Navbar from "@/components/Navbar";
import { Manrope, Space_Grotesk } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "AI Career Intelligence Agent",
  description: "AI-powered career insights for student profiles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-slate-950 text-slate-100`}
      >
        <AuthGate />
        <Navbar />
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
            <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-cyan-400/20 blur-[120px]" />
          </div>
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  );
}
