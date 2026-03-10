"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AuthGate from "@/components/AuthGate";
import { AdminMetricsRead, AdminStudentRead, getAdminMetrics, listAdminStudents } from "@/lib/api";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetricsRead | null>(null);
  const [students, setStudents] = useState<AdminStudentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [metricsData, studentsData] = await Promise.all([
          getAdminMetrics(),
          listAdminStudents(),
        ]);
        if (!mounted) return;
        setMetrics(metricsData);
        setStudents(studentsData);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load admin data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <AuthGate />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Placement Cell Dashboard</h1>
            <p className="text-sm text-slate-300">
              Track readiness and risks across all students.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            View Student Dashboard
          </Link>
        </header>

        {loading ? <p className="text-sm text-slate-400">Loading dashboard...</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {metrics ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Students</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {metrics.total_students}
              </p>
              <p className="text-sm text-slate-400">
                {metrics.total_profiles} profiles
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Placement Ready
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-200">
                {metrics.placement_ready}
              </p>
              <p className="text-sm text-slate-400">Low risk, high scores</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Needs Training
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-200">
                {metrics.needs_training}
              </p>
              <p className="text-sm text-slate-400">Medium readiness</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                High Risk
              </p>
              <p className="mt-2 text-3xl font-semibold text-rose-200">
                {metrics.high_risk}
              </p>
              <p className="text-sm text-slate-400">Needs immediate support</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Student Overview</h2>
          <p className="mt-1 text-sm text-slate-300">
            Latest readiness scores and placement risk per profile.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Program</th>
                  <th className="py-2 pr-4">CGPA</th>
                  <th className="py-2 pr-4">Employability</th>
                  <th className="py-2 pr-4">Risk</th>
                  <th className="py-2 pr-4">Profile</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.profile_id} className="border-t border-white/5">
                    <td className="py-3 pr-4 font-medium text-white">{student.name}</td>
                    <td className="py-3 pr-4">
                      {student.degree} â€¢ {student.specialization}
                    </td>
                    <td className="py-3 pr-4">{student.cgpa.toFixed(1)}</td>
                    <td className="py-3 pr-4">
                      {student.employability_score ?? "â€”"}
                    </td>
                    <td className="py-3 pr-4">{student.placement_risk ?? "â€”"}</td>
                    <td className="py-3 pr-4">
                      <Link
                        className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40"
                        href={`/analysis/${student.profile_id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {students.length === 0 ? (
                  <tr>
                    <td className="py-4 text-sm text-slate-400" colSpan={6}>
                      No students yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
