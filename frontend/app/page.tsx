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
    <div className="bg-gradient-to-b from-slate-50 to-slate-100">
      <section className="mx-auto max-w-5xl space-y-6 px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">
            AI Career Intelligence Agent
          </h1>
          <p className="text-xl text-slate-600">
            Get AI-powered career insights, skill gap analysis, and a personalized learning
            roadmap.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {savedProfileId ? (
              <>
                <Link
                  href={`/analysis/${savedProfileId}`}
                  className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Continue Career Analysis
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    clearStoredProfileId();
                    setSavedProfileId(null);
                  }}
                  className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  Reset Profile
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/create-profile"
                  className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Create Profile
                </Link>
                <Link
                  href="/analysis/1"
                  className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  View Example Dashboard
                </Link>
              </>
            )}
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
                className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/10 text-slate-900">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 text-center">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-10 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">
            Ready to see your AI career roadmap?
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Build your profile and get actionable career insights in minutes.
          </p>
          <div className="mt-6">
            <Link
              href="/create-profile"
              className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
