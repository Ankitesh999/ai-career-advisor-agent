"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStoredProfileId } from "@/lib/profile";
import { clearAuthRole, clearAuthToken, getAuthRole } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("auth_token")));
    setIsAdmin(getAuthRole() === "admin");
  }, []);

  const handleReset = () => {
    clearStoredProfileId();
    router.push("/create-profile");
  };

  const handleLogout = () => {
    clearAuthToken();
    clearAuthRole();
    clearStoredProfileId();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-white">
          AI Career Intelligence
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          {isAuthed ? (
            <>
              <Link href="/dashboard" className="transition hover:text-white">
                Dashboard
              </Link>
              <Link href="/training" className="transition hover:text-white">
                Training
              </Link>
              <Link href="/internship" className="transition hover:text-white">
                Internship Readiness
              </Link>
              {isAdmin ? (
                <Link href="/admin/dashboard" className="transition hover:text-white">
                  Admin Dashboard
                </Link>
              ) : null}
              <Link href="/resume" className="transition hover:text-white">
                Resume Scan
              </Link>
              <Link href="/create-profile" className="transition hover:text-white">
                Create Profile
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-medium text-slate-400 transition hover:text-white"
              >
                Reset Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-3 py-1 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-white">
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-white/20 px-4 py-1 text-white transition hover:border-white/50"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
