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
    <div className="h-80 w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">Career Recommendations</h3>
        <p className="text-sm text-slate-300">Top career paths based on your profile</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="role" tick={{ fontSize: 12, fill: "#cbd5f5" }} interval={0} />
          <YAxis tick={{ fontSize: 12, fill: "#cbd5f5" }} />
          <Tooltip
            cursor={{ fill: "rgba(99, 102, 241, 0.15)" }}
            contentStyle={{
              borderRadius: 12,
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(15, 23, 42, 0.9)",
              color: "#e2e8f0",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.5)",
            }}
          />
          <Bar dataKey="score" fill="#818cf8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
