"use client";

import { motion } from "framer-motion";

import { CareerAnalysisRead } from "@/lib/api";

type BranchIntelligencePanelProps = {
  analysis: CareerAnalysisRead;
};

export default function BranchIntelligencePanel({ analysis }: BranchIntelligencePanelProps) {
  const aimlScore = analysis.aiml_score ?? null;
  const hasAIMLData =
    aimlScore !== null ||
    Boolean(analysis.aiml_roles?.length) ||
    Boolean(analysis.aiml_skills?.length) ||
    Boolean(analysis.aiml_roadmap?.length) ||
    Boolean(analysis.branch_reasoning?.length);

  if (!hasAIMLData) {
    return null;
  }

  const cappedScore = Math.max(0, Math.min(aimlScore ?? 0, 100));
  const aimlInsights = (analysis.industry_insights ?? []).filter(
    (item) => item.branch === "AIML"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6 shadow-lg backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
          <svg
            className="h-5 w-5 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Branch Intelligence</h2>
          <p className="text-sm text-slate-400">AIML Compatibility Analysis</p>
        </div>
      </div>

      {aimlScore !== null && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">AIML Fit Score</span>
            <span className="text-sm font-semibold text-indigo-400">{cappedScore}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${cappedScore}%` }}
            />
          </div>
        </div>
      )}

      {analysis.branch_reasoning && analysis.branch_reasoning.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">AIML Fit Factors</p>
          <ul className="space-y-1">
            {analysis.branch_reasoning.slice(0, 4).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                {item.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">AIML Career Roles</h3>
        <div className="space-y-2">
          {analysis.aiml_roles?.map((role, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <span className="text-sm text-slate-300">{role.role}</span>
              <span className="text-xs font-semibold text-indigo-400">{role.score}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">AIML Skills Required</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.aiml_skills?.map((skill, idx) => (
            <span
              key={idx}
              className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">AIML Learning Roadmap</h3>
        <div className="space-y-2">
          {analysis.aiml_roadmap?.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <p className="text-xs font-semibold text-indigo-400">Year {item.year}</p>
              <p className="mt-1 text-sm text-slate-300">{item.topics.join(", ")}</p>
            </div>
          ))}
        </div>
      </div>

      {aimlInsights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">AIML Industry Insights</h3>
          <div className="grid gap-2">
            {aimlInsights.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                <p className="text-xs font-semibold text-indigo-400">{item.branch}</p>
                <p className="mt-1 text-sm text-slate-300">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
