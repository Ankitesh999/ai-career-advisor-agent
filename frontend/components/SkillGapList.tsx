"use client";

type SkillGap = { skill: string; priority: string };

type SkillGapListProps = {
  items: SkillGap[];
};

export default function SkillGapList({ items }: SkillGapListProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <h3 className="mb-4 text-base font-semibold text-white">Skill Gaps</h3>
      <ul className="flex flex-wrap gap-2 text-sm text-slate-200">
        {items.map((gap) => (
          <li
            key={`${gap.skill}-${gap.priority}`}
            className="flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-indigo-100"
          >
            <span>{gap.skill}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-indigo-50">
              {gap.priority.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
