import "./globals.css";

import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AI Career Intelligence Agent",
  description: "AI-powered career insights for student profiles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
