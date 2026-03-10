"use client";

type SkillGap = { skill: string; priority: string };

type SkillGapListProps = {
  items: SkillGap[];
};

export default function SkillGapList({ items }: SkillGapListProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Skill Gaps</h3>
      <ul className="space-y-2 text-sm text-slate-600">
        {items.map((gap) => (
          <li key={`${gap.skill}-${gap.priority}`} className="flex items-center justify-between">
            <span>{gap.skill}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {gap.priority}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
