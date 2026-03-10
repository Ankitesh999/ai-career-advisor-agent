"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AuthGate from "@/components/AuthGate";
import { getStoredProfileId } from "@/lib/profile";
import {
  InternshipReadinessRead,
  getInternshipReadiness,
  generateInternshipReadiness,
} from "@/lib/api";

const LEVEL_STYLES: Record<string, string> = {
  High: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  Medium: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  Low: "border-rose-400/30 bg-rose-500/10 text-rose-100",
};

export default function InternshipPage() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [data, setData] = useState<InternshipReadinessRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredProfileId();
    const id = stored ? Number(stored) : null;
    setProfileId(id && Number.isFinite(id) ? id : null);
  }, []);

  useEffect(() => {
    async function load() {
      if (!profileId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await getInternshipReadiness(profileId);
        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [profileId]);

  async function handleGenerate() {
    if (!profileId) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateInternshipReadiness(profileId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate readiness.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <AuthGate />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Internship Readiness</h1>
            <p className="text-sm text-slate-300">
              See how prepared you are for internships and what to improve.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Back to Dashboard
          </Link>
        </header>

        {loading ? <p className="text-sm text-slate-400">Loading readiness...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!profileId ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <p className="text-sm text-slate-300">
              Create a profile to view internship readiness.
            </p>
            <Link
              href="/create-profile"
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Create Profile
            </Link>
          </div>
        ) : null}

        {profileId && !data ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <p className="text-sm text-slate-300">
              No readiness score yet. Generate one now.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-70"
            >
              {generating ? "Generating..." : "Generate Readiness"}
            </button>
          </div>
        ) : null}

        {data ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Readiness Score
              </p>
              <div className="mt-4 flex items-center gap-4">
                <p className="text-4xl font-semibold text-white">{data.readiness_score}</p>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${LEVEL_STYLES[data.readiness_level]}`}
                >
                  {data.readiness_level.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Based on academics, projects, skills, and internships.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <h2 className="text-lg font-semibold text-white">Action Plan</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {data.action_plan.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 disabled:opacity-70"
              >
                {generating ? "Refreshing..." : "Recalculate"}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
