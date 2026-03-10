"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Compass, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { clearStoredProfileId, getStoredProfileId } from "@/lib/profile";

const features = [
  {
    title: "Create Profile",
    description: "Enter academic background, skills, and interests in minutes.",
    icon: Brain,
  },
  {
    title: "AI Career Analysis",
    description: "AI analyzes your profile and ranks the best career paths.",
    icon: Sparkles,
  },
  {
    title: "Skill Roadmap",
    description: "Get a step-by-step learning plan tailored to your goals.",
    icon: Compass,
  },
];

export default function HomePage() {
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredProfileId();
    if (stored) {
      setSavedProfileId(stored);
    }
  }, []);

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
              AI Career Intelligence
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              AI Career Intelligence Agent
            </h1>
            <p className="text-lg text-slate-300">
              Get AI-powered career insights, skill gap analysis, and a personalized learning
              roadmap tailored to your goals.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {savedProfileId ? (
                <>
                  <Link
                    href={`/analysis/${savedProfileId}`}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Continue Career Analysis
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      clearStoredProfileId();
                      setSavedProfileId(null);
                    }}
                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                  >
                    Reset Profile
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/create-profile"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Create Profile
                  </Link>
                  <Link
                    href="/analysis/1"
                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                  >
                    View Example Dashboard
                  </Link>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4 text-sm text-slate-300">
              <div>
                <p className="text-2xl font-semibold text-white">85%</p>
                <p>Role fit accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">5+</p>
                <p>Insight categories</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-white">24h</p>
                <p>Updated trends</p>
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
                  <p className="mt-2 text-3xl font-semibold text-white">AI Engineer</p>
                  <p className="text-sm text-slate-300">Fit Score: 82</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-400">Top Skill Gap</p>
                    <p className="mt-2 text-lg font-semibold text-white">MLOps</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-400">Next Milestone</p>
                    <p className="mt-2 text-lg font-semibold text-white">Portfolio Project</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Projected Entry Salary</p>
                  <p className="mt-2 text-2xl font-semibold text-white">₹6L – ₹12L</p>
                </div>
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
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-lg backdrop-blur"
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
            Ready to see your AI career roadmap?
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Build your profile and get actionable career insights in minutes.
          </p>
          <div className="mt-6">
            <Link
              href="/create-profile"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
