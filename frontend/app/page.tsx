export default function HomePage() {
  return (
    <section className="mx-auto max-w-5xl space-y-6 px-6 py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-900">AI Career Intelligence Agent</h1>
      <p className="text-lg text-slate-600">
        Get AI-powered career insights, skill gap analysis, and a personalized learning
        roadmap.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="/create-profile"
          className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Create Profile
        </a>
        <a
          href="/analysis/1"
          className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        >
          View Example Dashboard
        </a>
      </div>
    </section>
  );
}
