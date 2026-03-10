"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearStoredProfileId } from "@/lib/profile";

export default function Navbar() {
  const router = useRouter();

  const handleReset = () => {
    clearStoredProfileId();
    router.push("/create-profile");
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
        </nav>
      </div>
    </header>
  );
}
