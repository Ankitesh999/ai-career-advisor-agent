"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createProfile, StudentProfileCreate, StudentProfileRead } from "@/lib/api";
import { setStoredProfileId } from "@/lib/profile";

type ProfileFormProps = {
  onCreated?: (profile: StudentProfileRead) => void;
  initialValues?: Partial<StudentProfileCreate>;
  onSubmitOverride?: (payload: StudentProfileCreate) => Promise<StudentProfileRead>;
  submitLabel?: string;
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
    };
  }, [form]);

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
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Name
          <input
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
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
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Current Skills (comma-separated)
        <input
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={form.current_skills}
          onChange={(event) => setForm({ ...form, current_skills: event.target.value })}
          placeholder="Python, SQL, TensorFlow"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Interests (comma-separated)
        <input
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={form.interests}
          onChange={(event) => setForm({ ...form, interests: event.target.value })}
          placeholder="AI, Robotics, HealthTech"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Target Industry
        <input
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          value={form.target_industry}
          onChange={(event) => setForm({ ...form, target_industry: event.target.value })}
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Projects
          <input
            type="number"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={form.projects}
            onChange={(event) => setForm({ ...form, projects: event.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Internships
          <input
            type="number"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={form.internships}
            onChange={(event) => setForm({ ...form, internships: event.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Certifications
          <input
            type="number"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            value={form.certifications}
            onChange={(event) =>
              setForm({ ...form, certifications: event.target.value })
            }
            required
          />
        </label>
      </div>

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
