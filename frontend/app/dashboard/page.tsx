"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { StudentProfileRead, getAnalysis, listProfiles, CareerAnalysisRead } from "@/lib/api";
import { getStoredProfileId, getStoredUserType, setStoredProfileId, setStoredUserType } from "@/lib/profile";
import BranchIntelligencePanel from "@/components/BranchIntelligencePanel";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileRead | null>(null);
  const [analysis, setAnalysis] = useState<CareerAnalysisRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTwelfth, setIsTwelfth] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const profiles = await listProfiles();
        if (!mounted) return;

        if (profiles.length === 0) {
          router.push("/create-profile");
          return;
        }

        const latestProfile = profiles.reduce((latest, current) => {
          const latestDate = new Date(latest.created_at).getTime();
          const currentDate = new Date(current.created_at).getTime();
          return currentDate > latestDate ? current : latest;
        });

        setProfile(latestProfile);
        setStoredProfileId(latestProfile.id);

        const storedUserType = latestProfile.user_type || getStoredUserType();
        const isTwelfthStudent = storedUserType === "twelfth_student" || (!storedUserType && !latestProfile.degree);
        setIsTwelfth(isTwelfthStudent);
        setStoredUserType(isTwelfthStudent ? "twelfth_student" : "college_student");

        try {
          const analysisData = await getAnalysis(latestProfile.id);
          setAnalysis(analysisData);
        } catch {
          setAnalysis(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load profiles.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const formatSalaryRange = (salary: CareerAnalysisRead["salary_insights"]) => {
    if (!salary) return "—";
    const { currency, estimate_min, estimate_max } = salary;
    if (currency === "INR") {
      const minLakhs = estimate_min / 100000;
      const maxLakhs = estimate_max / 100000;
      return `₹${minLakhs.toFixed(1)}L – ₹${maxLakhs.toFixed(1)}L`;
    }
    return `${estimate_min} – ${estimate_max} ${currency}`;
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm text-red-400">{error}</p>
        <Link href="/create-profile" className="mt-4 inline-block text-white hover:underline">
          Create a new profile
        </Link>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-300">No profile found.</p>
          <Link href="/create-profile" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            Create Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {isTwelfth ? "Branch Analysis Dashboard" : "Career Dashboard"}
          </h1>
          <p className="text-sm text-slate-300">
            {isTwelfth
              ? "AI-powered branch recommendation based on your profile."
              : "Manage and revisit your career analysis."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/profile/${profile.id}`}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            View Profile
          </Link>
          {!isTwelfth && (
            <>
              <Link
                href="/internship"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Internship Readiness
              </Link>
              <Link
                href="/training"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                View Training Recommendations
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
            <p className="text-sm text-slate-300">
              {isTwelfth
                ? `12th Percentage: ${profile.twelfth_percentage}%`
                : `${profile.degree} • ${profile.specialization} (CGPA: ${profile.cgpa})`}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {isTwelfth ? "12th Student" : "College Student"}
          </span>
        </div>
        <Link
          href={`/profiles/${profile.id}/edit`}
          className="mt-4 inline-flex rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40"
        >
          Edit Profile
        </Link>
      </div>

      {isTwelfth ? (
        <>
          {!analysis ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <p className="text-sm font-semibold text-white">No AI analysis yet.</p>
              <p className="text-sm text-slate-300">
                Generate branch analysis to see AIML vs Cyber Security recommendations.
              </p>
              <Link
                href={`/analysis/${profile.id}`}
                className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Generate Branch Analysis
              </Link>
            </div>
          ) : (
            <>
              <BranchIntelligencePanel analysis={analysis} />
              {analysis.branch_reasoning && analysis.branch_reasoning.length > 0 && (
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                  <h3 className="text-lg font-semibold text-indigo-300 mb-2">Why AIML is Recommended for You</h3>
                  <ul className="list-disc pl-5 text-slate-200">
                    {analysis.branch_reasoning.map((item, idx) => (
                      <li key={idx}>{item.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.aiml_roles && analysis.aiml_roles.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">AIML Career Roles & Salary Packages</h3>
                  <ul className="list-disc pl-5 text-slate-200 mb-3">
                    {analysis.aiml_roles.map((role, idx) => (
                      <li key={idx}>{role.role} ({role.score}%)</li>
                    ))}
                  </ul>
                  {analysis.salary_insights && (
                    <div className="text-slate-300">
                      Estimated Salary Range: <span className="font-semibold text-white">{formatSalaryRange(analysis.salary_insights)}</span>
                    </div>
                  )}
                </div>
              )}
              <Link
                href={`/analysis/${profile.id}`}
                className="inline-flex items-center rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                View Full Analysis
              </Link>
            </>
          )}
        </>
      ) : (
        <>
          {analysis && (
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Skill Gaps</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {analysis.skill_gaps.length} priority areas
                </p>
                <p className="text-sm text-slate-400">Focus for next 90 days</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Roadmap Stages</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {analysis.learning_roadmap.length} stages
                </p>
                <p className="text-sm text-slate-400">Structured learning path</p>
              </div>
            </div>
          )}
          <Link
            href={`/analysis/${profile.id}`}
            className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            {analysis ? "View Full Analysis" : "Generate Career Analysis"}
          </Link>
        </>
      )}
    </main>
  );
}
