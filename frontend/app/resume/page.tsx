"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AuthGate from "@/components/AuthGate";
import { getStoredProfileId } from "@/lib/profile";
import { getResumeAnalysis, uploadResume, ResumeAnalysisRead } from "@/lib/api";

export default function ResumePage() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysisRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredProfileId();
    const id = stored ? Number(stored) : null;
    setProfileId(id && Number.isFinite(id) ? id : null);
  }, []);

  useEffect(() => {
    async function fetchLatest() {
      if (!profileId) {
        setLoading(false);
        return;
      }
      try {
        const result = await getResumeAnalysis(profileId);
        setAnalysis(result);
      } catch {
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    }
    void fetchLatest();
  }, [profileId]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profileId) return;
    setError(null);
    setUploading(true);
    try {
      const result = await uploadResume(profileId, file);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze resume.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <AuthGate />
      <main className="mx-auto max-w-6xl px-6 py-10 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Resume AI Scanner</h1>
            <p className="mt-2 text-sm text-slate-300">
              Upload your resume to extract skills, projects, and improvement areas.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/40"
          >
            Back to Dashboard
          </Link>
        </div>

        {!profileId ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
            <p>You need a saved profile before running resume analysis.</p>
            <Link
              href="/create-profile"
              className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Create Profile
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-200">
                  Upload resume (PDF or DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleUpload}
                  className="text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-200"
                  disabled={uploading}
                />
              </div>
              {uploading ? (
                <p className="mt-3 text-sm text-slate-400">Analyzing resume...</p>
              ) : null}
              {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
              {loading ? (
                <p className="mt-3 text-sm text-slate-400">Loading resume analysis...</p>
              ) : null}
            </div>

            {analysis ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                  <p className="text-sm text-slate-400">Resume Score</p>
                  <p className="mt-2 text-4xl font-semibold text-white">
                    {analysis.resume_score}/100
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    Based on skills, projects, experience, and education signals.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-white">Missing Keywords</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.missing_keywords.length ? (
                      analysis.missing_keywords.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No missing keywords.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-white">Extracted Skills</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.extracted_skills.length ? (
                      analysis.extracted_skills.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No skills detected.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-white">Weak Sections</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.weak_sections.length ? (
                      analysis.weak_sections.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-100"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No weak sections detected.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-white">Projects</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-200">
                    {analysis.projects.length ? (
                      analysis.projects.map((item) => <li key={item}>• {item}</li>)
                    ) : (
                      <li className="text-slate-400">No projects detected.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-white">Experience</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-200">
                    {analysis.experience.length ? (
                      analysis.experience.map((item) => <li key={item}>• {item}</li>)
                    ) : (
                      <li className="text-slate-400">No experience detected.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-white">Education</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-200">
                    {analysis.education.length ? (
                      analysis.education.map((item) => <li key={item}>• {item}</li>)
                    ) : (
                      <li className="text-slate-400">No education section detected.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white">Improvement Suggestions</h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-200">
                    {analysis.suggestions.length ? (
                      analysis.suggestions.map((item) => <li key={item}>• {item}</li>)
                    ) : (
                      <li className="text-slate-400">No suggestions right now.</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}
