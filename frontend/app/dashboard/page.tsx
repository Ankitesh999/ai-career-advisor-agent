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
          <h1 className="text-2xl font-semibold text-white">Your Profiles</h1>
          <p className="text-sm text-slate-300">
            Manage and revisit your saved career profiles.
          </p>
        </div>
        <Link
          href="/create-profile"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          Create New Profile
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error && profiles.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
          <p className="text-sm text-slate-300">
            No profiles yet. Create your first career profile.
          </p>
          <Link
            href="/create-profile"
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
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
              className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg transition hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {profile.specialization}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {profile.degree} • {profile.specialization}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Created {new Date(profile.created_at).toLocaleDateString()}
              </p>
              <Link
                href={`/analysis/${profile.id}`}
                className="mt-4 inline-flex rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Open Analysis
              </Link>
              <Link
                href={`/profiles/${profile.id}/edit`}
                className="ml-2 mt-4 inline-flex rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}
