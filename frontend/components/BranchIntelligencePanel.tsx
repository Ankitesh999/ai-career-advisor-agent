"use client";

import { motion } from "framer-motion";

import { CareerAnalysisRead } from "@/lib/api";

type BranchIntelligencePanelProps = {
  analysis: CareerAnalysisRead;
};

export default function BranchIntelligencePanel({ analysis }: BranchIntelligencePanelProps) {
  const hasBranchData =
    analysis.aiml_score !== undefined && analysis.cyber_security_score !== undefined;

  if (!hasBranchData) {
    return null;
  }

  const aimlScore = analysis.aiml_score ?? 0;
  const cyberScore = analysis.cyber_security_score ?? 0;
  const maxScore = Math.max(aimlScore, cyberScore, 100);

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
          <p className="text-sm text-slate-400">AIML vs Cyber Security Compatibility Analysis</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">AIML</span>
              <span className="text-sm font-semibold text-indigo-400">{aimlScore}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(aimlScore / maxScore) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Cyber Security</span>
              <span className="text-sm font-semibold text-cyan-400">{cyberScore}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(cyberScore / maxScore) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Recommended Branch</p>
          <p className="text-2xl font-bold text-white">
            {analysis.recommended_branch === "AIML"
              ? "Artificial Intelligence & Machine Learning"
              : analysis.recommended_branch === "Cyber Security"
                ? "Cyber Security"
                : analysis.recommended_branch ?? "—"}
          </p>
          {analysis.branch_reasoning && analysis.branch_reasoning.length > 0 && (
            <ul className="mt-3 space-y-1">
              {analysis.branch_reasoning.slice(0, 3).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                  {item.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
          <h3 className="text-sm font-semibold text-slate-200">Cyber Security Career Roles</h3>
          <div className="space-y-2">
            {analysis.cyber_roles?.map((role, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <span className="text-sm text-slate-300">{role.role}</span>
                <span className="text-xs font-semibold text-cyan-400">{role.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
          <h3 className="text-sm font-semibold text-slate-200">Cyber Security Skills Required</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.cyber_skills?.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">AIML Learning Roadmap</h3>
          <div className="space-y-2">
            {analysis.aiml_roadmap?.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3"
              >
                <p className="text-xs font-semibold text-indigo-400">Year {item.year}</p>
                <p className="mt-1 text-sm text-slate-300">{item.topics.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Cyber Security Learning Roadmap</h3>
          <div className="space-y-2">
            {analysis.cyber_roadmap?.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3"
              >
                <p className="text-xs font-semibold text-cyan-400">Year {item.year}</p>
                <p className="mt-1 text-sm text-slate-300">{item.topics.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Industry Insights</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {analysis.industry_insights?.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-3 ${
                item.branch === "AIML"
                  ? "border border-indigo-500/20 bg-indigo-500/5"
                  : "border border-cyan-500/20 bg-cyan-500/5"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  item.branch === "AIML" ? "text-indigo-400" : "text-cyan-400"
                }`}
              >
                {item.branch}
              </p>
              <p className="mt-1 text-sm text-slate-300">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
