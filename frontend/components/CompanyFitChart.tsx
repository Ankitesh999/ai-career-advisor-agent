"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CompanyFitChartProps = {
  data: { company: string; score: number; rationale?: string | null }[];
};

function CompanyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { company: string; score: number; rationale?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 text-xs text-slate-200 shadow-lg">
      <p className="text-sm font-semibold text-white">{item.company}</p>
      <p className="mt-1">Score: {item.score}</p>
      {item.rationale ? <p className="mt-1 text-slate-300">{item.rationale}</p> : null}
    </div>
  );
}

export default function CompanyFitChart({ data }: CompanyFitChartProps) {
  return (
    <div className="h-72 w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Company Fit Predictor</h3>
        <p className="text-sm text-slate-300">
          Best-fit companies based on your academic and skill profile
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="company" tick={{ fontSize: 12, fill: "#cbd5f5" }} />
          <YAxis tick={{ fontSize: 12, fill: "#cbd5f5" }} />
          <Tooltip content={<CompanyTooltip />} />
          <Bar dataKey="score" fill="#38bdf8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
