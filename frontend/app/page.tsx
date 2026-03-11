"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Compass, FileText, Shield, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { clearStoredProfileId, getStoredProfileId } from "@/lib/profile";
import { getAuthRole } from "@/lib/api";

const features = [
  {
    title: "Student Profile Intake",
    description: "Capture academics, skills, projects, and internships to build your AI career profile.",
    icon: Brain,
  },
  {
    title: "AI Career Analysis",
    description: "Get role recommendations, skill gaps, and a personalized learning roadmap.",
    icon: Sparkles,
  },
  {
    title: "Employability & Risk",
    description: "See your placement readiness and identify risks early.",
    icon: Shield,
  },
  {
    title: "Resume AI Scanner",
    description: "Analyze resumes, detect missing keywords, and improve your profile.",
    icon: FileText,
  },
  {
    title: "Company Fit Predictor",
    description: "Match your skills with companies that align with your strengths.",
    icon: Target,
  },
  {
    title: "Training & Demand",
    description: "Track industry demand and training priorities for upcoming placements.",
    icon: Compass,
  },
];

export default function HomePage() {
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = getStoredProfileId();
    if (stored) {
      setSavedProfileId(stored);
    }
    setIsAdmin(getAuthRole() === "admin");
  }, []);

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
              SAGE – AI Career Intelligence
            </div>
            <h1 className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              Choose Your Path
            </h1>
            <p className="max-w-[600px] text-lg text-slate-400">
              An AI agent that helps students understand AIML education, career paths, and the skills needed—from admission to placement.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {savedProfileId ? (
                <>
                  <Link
                    href={`/analysis/${savedProfileId}`}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-xl transition hover:bg-slate-200 hover:shadow-blue-500/30"
                  >
                    Continue Career Analysis
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:border-white/40 hover:shadow-blue-500/30"
                    >
                      Placement Cell Dashboard
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      clearStoredProfileId();
                      setSavedProfileId(null);
                    }}
                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:border-white/40 hover:shadow-blue-500/30"
                  >
                    Reset Profile
                  </button>
                </>
              ) : (
                <>
                  <div className="grid w-full gap-4 md:grid-cols-2">
                    <Link
                      href="/create-profile?type=twelfth"
                      className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl backdrop-blur transition hover:bg-white/10 hover:shadow-blue-500/30"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                        <svg
                          className="h-6 w-6"
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
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300">
                        Branch Decision
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        For students choosing AIML after 12th.
                      </p>
                      <span className="mt-4 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-indigo-400">
                        Start Branch Analysis
                      </span>
                    </Link>

                    <Link
                      href="/create-profile?type=college"
                      className="group flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl backdrop-blur transition hover:bg-white/10 hover:shadow-blue-500/30"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300">
                        Career Path Analysis
                      </h3>
                      <p className="mt-2 text-sm text-slate-400">
                        For college students planning skills, internships, and placements.
                      </p>
                      <span className="mt-4 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-cyan-400">
                        Start Career Analysis
                      </span>
                    </Link>
                  </div>
                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:border-white/40 hover:shadow-blue-500/30"
                    >
                      Placement Cell Dashboard
                    </Link>
                  ) : null}
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4 text-sm text-slate-300">
              <div>
                <p className="text-2xl font-semibold text-white">High</p>
                <p>Role Fit Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">10+</p>
                <p>AI Intelligence Modules</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">Cohort</p>
                <p>Training Insights</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/30 via-cyan-500/20 to-transparent blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Career Momentum
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">Sample Role: AI Engineer</p>
                  <p className="text-sm text-slate-300">Fit Score: --</p>
                </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Employability Score</p>
                  <p className="mt-2 text-lg font-semibold text-white">--</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Placement Risk</p>
                  <p className="mt-2 text-lg font-semibold text-white">--</p>
                </div>
              </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Projected Entry Salary</p>
                  <p className="mt-2 text-2xl font-semibold text-white">--</p>
                </div>
                <p className="text-xs text-slate-500">*Generated after career analysis</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-lg backdrop-blur transition hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                  <Icon className="h-6 w-6 text-cyan-200" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 text-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">
            Build Your AI Career Roadmap
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Create your profile and receive personalized career insights in minutes.
          </p>
          <div className="mt-6">
            <Link
              href="/create-profile"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-xl transition hover:bg-slate-200 hover:shadow-blue-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
