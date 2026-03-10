"use client";

type SkillGap = { skill: string; priority: string };

type SkillGapListProps = {
  items: SkillGap[];
};

export default function SkillGapList({ items }: SkillGapListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">Skill Gaps</h3>
      <ul className="flex flex-wrap gap-2 text-sm text-slate-700">
        {items.map((gap) => (
          <li
            key={`${gap.skill}-${gap.priority}`}
            className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-blue-700"
          >
            <span>{gap.skill}</span>
            <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-800">
              {gap.priority.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
