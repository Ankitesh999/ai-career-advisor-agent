"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser, setAuthToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const result = await loginUser(email, password);
      setAuthToken(result.access_token);
      router.push("/create-profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold text-white">Log In</h1>
      <p className="mt-2 text-sm text-slate-300">
        Access your saved career profile and insights.
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <a className="font-semibold text-white hover:underline" href="/signup">
          Sign up
        </a>
      </p>
    </main>
  );
}
