"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";

import CareerChart from "@/components/CareerChart";
import CareerChat from "@/components/CareerChat";
import LearningRoadmap from "@/components/LearningRoadmap";
import SkillGapList from "@/components/SkillGapList";
import { CareerAnalysisRead, formatINR, generateAnalysis, getAnalysis } from "@/lib/api";

type AnalysisPageProps = {
  params: Promise<{ id: string }>;
};

const formatSalaryRange = (analysis: CareerAnalysisRead) => {
  const { currency, estimate_min, estimate_max } = analysis.salary_insights;
  if (currency === "INR") {
    return `${formatINR(estimate_min)} – ${formatINR(estimate_max)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(estimate_min).concat(" – ").concat(
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(estimate_max)
  );
};

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = use(params);
  const profileId = Number(id);
  const [analysis, setAnalysis] = useState<CareerAnalysisRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      setMissing(false);
      try {
        const data = await getAnalysis(profileId);
        if (mounted) {
          setAnalysis(data);
        }
      } catch (err) {
        if (!mounted) return;
        setAnalysis(null);
        const message = err instanceof Error ? err.message : "Failed to load analysis.";
        if (message.toLowerCase().includes("not found")) {
          setMissing(true);
        } else {
          setError(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (!Number.isNaN(profileId)) {
      void load();
    } else {
      setLoading(false);
      setError(null);
    }

    return () => {
      mounted = false;
    };
  }, [profileId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateAnalysis(profileId);
      setAnalysis(data);
      setMissing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate analysis.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRerun() {
    setRerunning(true);
    setError(null);
    try {
      const data = await generateAnalysis(profileId);
      setAnalysis(data);
      setMissing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-run analysis.");
    } finally {
      setRerunning(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Career Analysis</h1>
        <p className="text-sm text-slate-300">
          AI-generated insights tailored to this student profile.
        </p>
        {!loading && analysis ? (
          <button
            onClick={handleRerun}
            disabled={rerunning}
            className="inline-flex items-center rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40 disabled:opacity-70"
          >
            {rerunning ? "Re-running..." : "Re-run AI Analysis"}
          </button>
        ) : null}
      </header>

      {loading ? <p className="text-sm text-slate-400">Loading analysis...</p> : null}

      {!loading && Number.isNaN(profileId) ? (
        <p className="text-red-400">Invalid profile ID</p>
      ) : null}

      {!loading && missing ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <div>
            <p className="text-sm font-semibold text-white">
              No AI analysis found for this profile.
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Generate career insights to see recommendations, skill gaps, and learning
              roadmap.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {generating ? "Generating AI insights..." : "Generate Career Insights"}
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top Role</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {analysis.career_recommendations[0]?.role ?? "—"}
              </p>
              <p className="text-sm text-slate-400">
                Fit Score {analysis.career_recommendations[0]?.score ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Skill Gaps
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {analysis.skill_gaps.length} priority areas
              </p>
              <p className="text-sm text-slate-400">Focus for next 90 days</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Roadmap Stages
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {analysis.learning_roadmap.length} stages
              </p>
              <p className="text-sm text-slate-400">Structured learning path</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <CareerChart data={analysis.career_recommendations} />
              <SkillGapList items={analysis.skill_gaps} />
              <LearningRoadmap stages={analysis.learning_roadmap} />
            </div>

            <div className="space-y-6">
              <CareerChat profileId={profileId} />

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur"
              >
                <h3 className="text-sm font-semibold text-slate-300">
                  Estimated Entry-Level Salary
                </h3>
                <p className="mt-3 text-3xl font-bold text-white">
                  {formatSalaryRange(analysis)}
                </p>
                <p className="mt-2 text-sm text-slate-400">Entry Level AI Roles</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur"
              >
                <h3 className="mb-3 text-sm font-semibold text-slate-200">
                  Industry Trends
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {analysis.industry_trends.map((trend) => (
                    <li
                      key={`${trend.trend}-${trend.impact}`}
                      className="flex items-center justify-between"
                    >
                      <span>{trend.trend}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-200">
                        {trend.impact.toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </main>
  );
}
