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

type CareerChartProps = {
  data: { role: string; score: number }[];
};

export default function CareerChart({ data }: CareerChartProps) {
  return (
    <div className="h-80 w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Career Recommendations</h3>
        <p className="text-sm text-slate-600">Top career paths based on your profile</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="role" tick={{ fontSize: 12 }} interval={0} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.2)" }}
            contentStyle={{
              borderRadius: 12,
              borderColor: "#e2e8f0",
              boxShadow: "0 8px 16px rgba(15, 23, 42, 0.08)",
            }}
          />
          <Bar dataKey="score" fill="#0f172a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
