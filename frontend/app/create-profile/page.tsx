"use client";

import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { getStoredProfileId } from "@/lib/profile";
import { useSearchParams } from "next/navigation";

function CreateProfileContent() {
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const type = searchParams?.get("type");
  let formType: "twelfth" | "college" = "college";
  if (type === "twelfth") formType = "twelfth";

  useEffect(() => {
    const stored = getStoredProfileId();
    if (stored) {
      setSavedProfileId(stored);
    }
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold text-white">Create Your Career Profile</h1>
      <p className="mt-2 text-sm text-slate-300">
        Provide your academic background, skills, and interests to generate AI-powered
        career insights.
      </p>
      {savedProfileId ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
          <p className="text-sm text-slate-300">
            You already have a saved profile. Continue analysis or create a new one.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/analysis/${savedProfileId}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Continue Analysis
            </Link>
            <button
              type="button"
              onClick={() => setSavedProfileId(null)}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Create New Profile
            </button>
          </div>
        </div>
      ) : null}
      <div className="mt-6">
        <ProfileForm formType={formType} />
      </div>
    </>
  );
}

export default function CreateProfilePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <CreateProfileContent />
      </Suspense>
    </main>
  );
}
