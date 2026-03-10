"use client";

import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredProfileId } from "@/lib/profile";

export default function CreateProfilePage() {
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredProfileId();
    if (stored) {
      setSavedProfileId(stored);
    }
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Create Your Career Profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        Provide your academic background, skills, and interests to generate AI-powered
        career insights.
      </p>
      {savedProfileId ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">
            You already have a saved profile. Continue analysis or create a new one.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/analysis/${savedProfileId}`}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue Analysis
            </Link>
            <button
              type="button"
              onClick={() => setSavedProfileId(null)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Create New Profile
            </button>
          </div>
        </div>
      ) : null}
      <div className="mt-6">
        <ProfileForm />
      </div>
    </main>
  );
}
