"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { StudentProfileRead, listProfiles } from "@/lib/api";

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<StudentProfileRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listProfiles();
        if (mounted) {
          setProfiles(data);
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
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your Profiles</h1>
          <p className="text-sm text-slate-600">
            Manage and revisit your saved career profiles.
          </p>
        </div>
        <Link
          href="/create-profile"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Create New Profile
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error && profiles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-700">
            No profiles yet. Create your first career profile.
          </p>
          <Link
            href="/create-profile"
            className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Create Profile
          </Link>
        </div>
      ) : null}

      {profiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {profile.degree} • {profile.specialization}
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Created {new Date(profile.created_at).toLocaleDateString()}
              </p>
              <Link
                href={`/analysis/${profile.id}`}
                className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Open Analysis
              </Link>
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}
