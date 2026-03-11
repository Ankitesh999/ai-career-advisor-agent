"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";

import BranchIntelligencePanel from "@/components/BranchIntelligencePanel";
import CareerChart from "@/components/CareerChart";
import CareerChat from "@/components/CareerChat";
import CompanyFitChart from "@/components/CompanyFitChart";
import EmployabilityChart from "@/components/EmployabilityChart";
import LearningRoadmap from "@/components/LearningRoadmap";
import PlacementRiskCard from "@/components/PlacementRiskCard";
import RoleGapPanel from "@/components/RoleGapPanel";
import SkillGapList from "@/components/SkillGapList";
import {
  CareerAnalysisRead,
  CompanyFitRead,
  EmployabilityScoreRead,
  PlacementRiskRead,
  RoleGapRead,
  StudentProfileRead,
  generateCompanyFit,
  computeEmployabilityScore,
  formatINR,
  generateAnalysis,
  getAnalysis,
  getCompanyFit,
  getEmployabilityScore,
  getRoleGaps,
  getPlacementRisk,
  generateRoleGaps,
  generatePlacementRisk,
  getProfile,
} from "@/lib/api";

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
  const [profile, setProfile] = useState<StudentProfileRead | null>(null);
  const [companyFit, setCompanyFit] = useState<CompanyFitRead | null>(null);
  const [roleGaps, setRoleGaps] = useState<RoleGapRead | null>(null);
  const [placementRisk, setPlacementRisk] = useState<PlacementRiskRead | null>(null);
  const [employability, setEmployability] = useState<EmployabilityScoreRead | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ...existing hooks and logic...

  // ...existing useEffect and handler functions...

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
          {isTwelfth ? (
            <>
              {/* Branch analysis only for 12th students */}
              <BranchIntelligencePanel analysis={analysis} />
              {/* Optionally, show a summary or explanation for AIML recommendation */}
              {analysis.branch_reasoning && analysis.branch_reasoning.length > 0 && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-indigo-300 mb-2">Why AIML is recommended for you</h3>
                  <ul className="list-disc pl-5 text-slate-200">
                    {analysis.branch_reasoning.map((item, idx) => (
                      <li key={idx}>{item.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Show AIML roles and salary info if available */}
              {analysis.aiml_roles && analysis.aiml_roles.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-2">AIML Career Roles & Salary Packages</h3>
                  <ul className="list-disc pl-5 text-slate-200">
                    {analysis.aiml_roles.map((role, idx) => (
                      <li key={idx}>{role.role} ({role.score}%)</li>
                    ))}
                  </ul>
                  {analysis.salary_insights && (
                    <div className="mt-2 text-slate-300">Estimated Salary Range: {formatSalaryRange(analysis)}</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Full dashboard for college students */}
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
                  {companyFit ? <CompanyFitChart data={companyFit.matches} /> : null}
                  {employability ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Employability Score
                      </p>
                      <div className="mt-3 flex items-end justify-between">
                        <p className="text-4xl font-semibold text-white">
                          {employability.overall_score}
                        </p>
                        <p className="text-sm text-slate-400">out of 100</p>
                      </div>
                    </div>
                  ) : null}
                  <SkillGapList items={analysis.skill_gaps} />
                  <LearningRoadmap stages={analysis.learning_roadmap} />
                  {roleGaps ? <RoleGapPanel items={roleGaps.role_gaps} /> : null}
                </div>
                <div className="space-y-6">
                  <CareerChat profileId={profileId} />
                  {employability ? (
                    <EmployabilityChart
                      scores={{
                        academic_strength: employability.academic_strength,
                        technical_skills: employability.technical_skills,
                        industry_readiness: employability.industry_readiness,
                        resume_quality: employability.resume_quality,
                      }}
                    />
                  ) : null}
                  {placementRisk ? (
                    <PlacementRiskCard
                      level={placementRisk.risk_level}
                      reasons={placementRisk.reasons}
                    />
                  ) : null}
                </div>
              </div>
            </>
          )}
        </motion.div>
      ) : null}
    </main>
  );
    setRerunning(true);
    setError(null);
    try {
      const data = await generateAnalysis(profileId);
      setAnalysis(data);
      setMissing(false);
      const score = await computeEmployabilityScore(profileId);
      setEmployability(score);
      const fit = await generateCompanyFit(profileId);
      setCompanyFit(fit);
      const gaps = await generateRoleGaps(profileId);
      setRoleGaps(gaps);
      const risk = await generatePlacementRisk(profileId);
      setPlacementRisk(risk);
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

          {isTwelfth && <BranchIntelligencePanel analysis={analysis} />}

          {isTwelfth || (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <CareerChart data={analysis.career_recommendations} />
                {companyFit ? <CompanyFitChart data={companyFit.matches} /> : null}
                {employability ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Employability Score
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <p className="text-4xl font-semibold text-white">
                        {employability.overall_score}
                      </p>
                      <p className="text-sm text-slate-400">out of 100</p>
                    </div>
                  </div>
                ) : null}
                <SkillGapList items={analysis.skill_gaps} />
                <LearningRoadmap stages={analysis.learning_roadmap} />
                {roleGaps ? <RoleGapPanel items={roleGaps.role_gaps} /> : null}
              </div>

              <div className="space-y-6">
                <CareerChat profileId={profileId} />
                {employability ? (
                  <EmployabilityChart
                    scores={{
                      academic_strength: employability.academic_strength,
                      technical_skills: employability.technical_skills,
                      industry_readiness: employability.industry_readiness,
                      resume_quality: employability.resume_quality,
                    }}
                  />
                ) : null}
                {placementRisk ? (
                  <PlacementRiskCard
                    level={placementRisk.risk_level}
                    reasons={placementRisk.reasons}
                  />
                ) : null}

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
          )}
        </motion.div>
      ) : null}
    </main>
  );
}
