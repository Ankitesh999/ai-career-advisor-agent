"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AuthGate from "@/components/AuthGate";
import {
  TrainingRecommendationsRead,
  IndustryDemandRead,
  getIndustryDemand,
  getTrainingRecommendations,
} from "@/lib/api";

export default function TrainingPage() {
  const [data, setData] = useState<TrainingRecommendationsRead | null>(null);
  const [demand, setDemand] = useState<IndustryDemandRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [result, demandData] = await Promise.all([
          getTrainingRecommendations(),
          getIndustryDemand(),
        ]);
        if (mounted) {
          setData(result);
          setDemand(demandData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load training data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <AuthGate />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Training Recommendations
            </h1>
            <p className="text-sm text-slate-300">
              Cohort-level weak skills and suggested training programs.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Back to Dashboard
          </Link>
        </header>

        {loading ? <p className="text-sm text-slate-400">Loading recommendations...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {data ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Students in Cohort
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {data.total_students}
                </p>
              </div>
              {demand ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Industry Demand {demand.year}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {demand.trends.length}
                  </p>
                  <p className="text-sm text-slate-400">Trending skills</p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Top Weak Skills</h2>
                <div className="mt-4 space-y-3">
                  {data.weak_skills.length ? (
                    data.weak_skills.map((item) => (
                      <div
                        key={item.skill}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3"
                      >
                        <span className="text-sm text-white">{item.skill}</span>
                        <span className="text-xs text-slate-300">
                          {item.count} students
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No gap data yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="text-lg font-semibold text-white">
                  Recommended Training Programs
                </h2>
                <div className="mt-4 space-y-4">
                  {data.programs.length ? (
                    data.programs.map((program) => (
                      <div
                        key={program.title}
                        className="rounded-xl border border-white/10 bg-slate-900/40 p-4"
                      >
                        <h3 className="text-sm font-semibold text-white">
                          {program.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-300">
                          {program.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {program.focus_skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No program suggestions yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                <h2 className="text-lg font-semibold text-white">
                  Industry Demand Trends
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  What the market is hiring for right now.
                </p>
                <div className="mt-4 space-y-3">
                  {demand?.trends.length ? (
                    demand.trends.map((item) => (
                      <div
                        key={item.trend}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3"
                      >
                        <span className="text-sm text-white">{item.trend}</span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-200">
                          {item.impact.toUpperCase()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No demand data yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}
