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

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Career Analysis</h1>
        <p className="text-sm text-slate-600">
          AI-generated insights tailored to this student profile.
        </p>
      </header>

      {loading ? <p className="text-sm text-slate-500">Loading analysis...</p> : null}

      {!loading && Number.isNaN(profileId) ? (
        <p className="text-red-500">Invalid profile ID</p>
      ) : null}

      {!loading && missing ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              No AI analysis found for this profile.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Generate career insights to see recommendations, skill gaps, and learning
              roadmap.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {generating ? "Generating AI insights..." : "Generate Career Insights"}
          </button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
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
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-slate-600">
                  Estimated Entry-Level Salary
                </h3>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {formatSalaryRange(analysis)}
                </p>
                <p className="mt-2 text-sm text-slate-500">Entry Level AI Roles</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  Industry Trends
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {analysis.industry_trends.map((trend) => (
                    <li
                      key={`${trend.trend}-${trend.impact}`}
                      className="flex items-center justify-between"
                    >
                      <span>{trend.trend}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
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
