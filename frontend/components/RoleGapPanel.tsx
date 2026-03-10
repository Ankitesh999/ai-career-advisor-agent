"use client";

type RoleGapPanelProps = {
  items: { role: string; missing_skills: string[]; learning_plan: string[] }[];
};

export default function RoleGapPanel({ items }: RoleGapPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Role Skill Gaps</h3>
        <p className="text-sm text-slate-300">
          Compare your skills with role requirements and recommended next steps
        </p>
      </div>

      <div className="space-y-4">
        {items.map((role) => (
          <div
            key={role.role}
            className="rounded-xl border border-white/10 bg-slate-900/40 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{role.role}</p>
              <span className="text-xs text-slate-400">
                {role.missing_skills.length} gaps
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {role.missing_skills.length ? (
                role.missing_skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No major gaps.</span>
              )}
            </div>

            <ul className="mt-3 space-y-1 text-xs text-slate-300">
              {role.learning_plan.map((step) => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
