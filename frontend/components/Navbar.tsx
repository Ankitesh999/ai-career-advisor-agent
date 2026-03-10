"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearStoredProfileId } from "@/lib/profile";
import { clearAuthToken } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("auth_token")));
  }, []);

  const handleReset = () => {
    clearStoredProfileId();
    router.push("/create-profile");
  };

  const handleLogout = () => {
    clearAuthToken();
    clearStoredProfileId();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 px-6 py-4 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          AI Career Intelligence
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="transition hover:text-slate-900">
            Home
          </Link>
          {isAuthed ? (
            <>
              <Link href="/dashboard" className="transition hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/create-profile" className="transition hover:text-slate-900">
                Create Profile
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Reset Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-slate-900">
                Log In
              </Link>
              <Link href="/signup" className="transition hover:text-slate-900">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
