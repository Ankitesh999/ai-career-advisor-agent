"use client";

type PlacementRiskCardProps = {
  level: string;
  reasons: string[];
};

const LEVEL_STYLES: Record<string, { badge: string; text: string }> = {
  High: { badge: "bg-rose-500/15 text-rose-100 border-rose-400/30", text: "High" },
  Medium: {
    badge: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    text: "Medium",
  },
  Low: { badge: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30", text: "Low" },
};

export default function PlacementRiskCard({ level, reasons }: PlacementRiskCardProps) {
  const style = LEVEL_STYLES[level] ?? LEVEL_STYLES.Medium;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Placement Risk</h3>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.badge}`}
        >
          {style.text.toUpperCase()}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{style.text} Risk</p>
      <ul className="mt-3 space-y-1 text-xs text-slate-300">
        {reasons.map((reason) => (
          <li key={reason}>• {reason}</li>
        ))}
      </ul>
    </div>
  );
}
