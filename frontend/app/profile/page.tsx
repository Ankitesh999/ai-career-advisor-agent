"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { StudentProfileRead, listProfiles } from "@/lib/api";
import { clearStoredProfileId, clearStoredUserType, getStoredProfileId, setStoredProfileId } from "@/lib/profile";
import Link from "next/link";

export default function ProfileIndexPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    clearStoredProfileId();
    clearStoredUserType();
    router.push("/");
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const storedId = getStoredProfileId();
        
        if (storedId) {
          const profiles = await listProfiles();
          const found = profiles.find(p => p.id === Number(storedId));
          if (found && mounted) {
            setProfile(found);
            setLoading(false);
            return;
          }
        }

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

        setStoredProfileId(latestProfile.id);
        setProfile(latestProfile);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load profile.");
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

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-red-400">{error}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-slate-300">No profile found.</p>
        <Link href="/create-profile" className="mt-4 inline-block text-white hover:underline">
          Create a new profile
        </Link>
      </main>
    );
  }

  const isTwelfth = !profile.degree;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Your Profile</h1>
        <p className="text-sm text-slate-300">
          View and manage your profile information.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {isTwelfth ? "12th Student" : "College Student"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">12th Percentage</p>
            <p className="mt-1 text-lg font-semibold text-white">{profile.twelfth_percentage}%</p>
          </div>
          {!isTwelfth && (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">CGPA</p>
                <p className="mt-1 text-lg font-semibold text-white">{profile.cgpa}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Degree</p>
                <p className="mt-1 text-lg font-semibold text-white">{profile.degree}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Specialization</p>
                <p className="mt-1 text-lg font-semibold text-white">{profile.specialization}</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Interests</p>
            <p className="mt-1 text-white">{profile.interests?.join(", ") || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Target Industry</p>
            <p className="mt-1 text-white">{profile.target_industry || "—"}</p>
          </div>
          {!isTwelfth && (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Skills</p>
                <p className="mt-1 text-white">{profile.current_skills?.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Projects / Internships / Certifications</p>
                <p className="mt-1 text-white">
                  {profile.projects} / {profile.internships} / {profile.certifications}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-400">
            Profile created: {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/profiles/${profile.id}/edit`}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Edit Profile
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Go to Dashboard
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10"
          >
            Reset Profile
          </button>
        </div>
      </div>
    </main>
  );
}
