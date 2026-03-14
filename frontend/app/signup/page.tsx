"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  StudentType,
  getMe,
  loginUser,
  registerUser,
  setAuthRole,
  setAuthToken,
} from "@/lib/api";
import { setStoredUserType } from "@/lib/profile";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentType, setStudentType] = useState<StudentType | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!studentType) {
      setError("Please select whether you are a 12th or college student.");
      return;
    }

    try {
      setLoading(true);
      await registerUser(email, password, studentType);
      const token = await loginUser(email, password);
      setAuthToken(token.access_token);
      const me = await getMe();
      setAuthRole(me.role);
      setStoredUserType(me.student_type || studentType);
      router.push("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold text-white">Create Account</h1>
      <p className="mt-2 text-sm text-slate-300">
        Sign up to save your career profiles and insights.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur"
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Email
          <input
            type="email"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Password
          <input
            type="password"
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <fieldset className="rounded-md border border-white/10 bg-white/5 p-3">
          <legend className="px-1 text-sm font-medium text-slate-200">
            Student Type
          </legend>
          <div className="mt-2 flex gap-6 text-sm text-slate-200">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="studentType"
                value="twelfth_student"
                checked={studentType === "twelfth_student"}
                onChange={() => setStudentType("twelfth_student")}
                required
              />
              12th Student
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="studentType"
                value="college_student"
                checked={studentType === "college_student"}
                onChange={() => setStudentType("college_student")}
                required
              />
              College Student
            </label>
          </div>
        </fieldset>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </form>
    </main>
  );
}
