"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createProfile, StudentProfileCreate, StudentProfileRead } from "@/lib/api";
import { setStoredProfileId, setStoredUserType } from "@/lib/profile";

type ProfileFormProps = {
  onCreated?: (profile: StudentProfileRead) => void;
  initialValues?: Partial<StudentProfileCreate>;
  onSubmitOverride?: (payload: StudentProfileCreate) => Promise<StudentProfileRead>;
  submitLabel?: string;
  formType?: "twelfth" | "college";
};

const parseCommaList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ProfileForm({
  onCreated,
  initialValues,
  onSubmitOverride,
  submitLabel,
  formType = "college",
}: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    twelfth_percentage:
      initialValues?.twelfth_percentage !== undefined
        ? String(initialValues.twelfth_percentage)
        : "",
    cgpa: initialValues?.cgpa !== undefined ? String(initialValues.cgpa) : "",
    degree: initialValues?.degree ?? "",
    specialization: initialValues?.specialization ?? "",
    current_skills: initialValues?.current_skills?.join(", ") ?? "",
    interests: initialValues?.interests?.join(", ") ?? "",
    target_industry: initialValues?.target_industry ?? "",
    projects: initialValues?.projects !== undefined ? String(initialValues.projects) : "0",
    internships:
      initialValues?.internships !== undefined ? String(initialValues.internships) : "0",
    certifications:
      initialValues?.certifications !== undefined
        ? String(initialValues.certifications)
        : "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload: StudentProfileCreate | null = useMemo(() => {
    const twelfth = Number(form.twelfth_percentage);
    const cgpa = Number(form.cgpa);
    if (!form.name || Number.isNaN(twelfth) || Number.isNaN(cgpa)) {
      return null;
    }

    const userType = formType === "twelfth" ? "twelfth_student" : "college_student";

    return {
      name: form.name,
      twelfth_percentage: twelfth,
      cgpa,
      degree: form.degree,
      specialization: form.specialization,
      current_skills: parseCommaList(form.current_skills),
      interests: parseCommaList(form.interests),
      target_industry: form.target_industry,
      projects: Number(form.projects) || 0,
      internships: Number(form.internships) || 0,
      certifications: Number(form.certifications) || 0,
      user_type: userType,
    };
  }, [form, formType]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!payload) {
      setError("Please fill in the required fields.");
      return;
    }

    try {
      setLoading(true);
      const result = onSubmitOverride
        ? await onSubmitOverride(payload)
        : await createProfile(payload);
      setStoredProfileId(result.id);
      const userType = payload.user_type || (formType === "twelfth" ? "twelfth_student" : "college_student");
      setStoredUserType(userType);
      router.push(`/analysis/${result.id}`);
      onCreated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {/* Name is always required */}
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Name
          <input
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        {/* 12th Percentage for twelfth, CGPA for college */}
        {formType === "twelfth" ? (
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            12th Percentage
            <input
              type="number"
              step="0.1"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              value={form.twelfth_percentage}
              onChange={(event) =>
                setForm({ ...form, twelfth_percentage: event.target.value })
              }
              required
            />
          </label>
        ) : (
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            CGPA
            <input
              type="number"
              step="0.1"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              value={form.cgpa}
              onChange={(event) => setForm({ ...form, cgpa: event.target.value })}
              required
            />
          </label>
        )}
        {/* Degree and Specialization for college only */}
        {formType === "college" && (
          <>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Degree
              <input
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                value={form.degree}
                onChange={(event) => setForm({ ...form, degree: event.target.value })}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Specialization
              <input
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                value={form.specialization}
                onChange={(event) => setForm({ ...form, specialization: event.target.value })}
                required
              />
            </label>
          </>
        )}
      </div>

      {/* Skills for college only */}
      {formType === "college" && (
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Current Skills (comma-separated)
          <input
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={form.current_skills}
            onChange={(event) => setForm({ ...form, current_skills: event.target.value })}
            placeholder="Python, SQL, TensorFlow"
          />
        </label>
      )}

      {/* Interests for both */}
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Interests (comma-separated)
        <input
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={form.interests}
          onChange={(event) => setForm({ ...form, interests: event.target.value })}
          placeholder="AI, Robotics, HealthTech"
        />
      </label>

      {/* Target Industry for both, optional for twelfth */}
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Target Industry {formType === "twelfth" && <span className="text-xs text-slate-400">(optional)</span>}
        <input
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={form.target_industry}
          onChange={(event) => setForm({ ...form, target_industry: event.target.value })}
          // required for college, optional for twelfth
          required={formType === "college"}
        />
      </label>

      {/* Projects, Internships, Certifications for college only (hidden for both as per requirements) */}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Saving..." : submitLabel ?? "Create Profile"}
      </button>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
