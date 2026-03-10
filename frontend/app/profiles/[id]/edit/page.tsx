"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileForm from "@/components/ProfileForm";
import { StudentProfileCreate, getProfile, updateProfile } from "@/lib/api";

type EditProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = use(params);
  const profileId = Number(id);
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<StudentProfileCreate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const profile = await getProfile(profileId);
        if (mounted) {
          setInitialValues({
            name: profile.name,
            twelfth_percentage: profile.twelfth_percentage,
            degree: profile.degree,
            specialization: profile.specialization,
            current_skills: profile.current_skills,
            interests: profile.interests,
            target_industry: profile.target_industry,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load profile.");
        }
      }
    }

    if (!Number.isNaN(profileId)) {
      void load();
    } else {
      setError("Invalid profile ID.");
    }

    return () => {
      mounted = false;
    };
  }, [profileId]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        Update your profile details and re-run AI analysis.
      </p>
      <div className="mt-6">
        {initialValues ? (
          <ProfileForm
            initialValues={initialValues}
            submitLabel="Save Changes"
            onSubmitOverride={(payload) => updateProfile(profileId, payload)}
            onCreated={() => router.push(`/analysis/${profileId}`)}
          />
        ) : (
          <p className="text-sm text-slate-500">Loading profile...</p>
        )}
      </div>
    </main>
  );
}
