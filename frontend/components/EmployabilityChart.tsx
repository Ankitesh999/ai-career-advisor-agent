"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type EmployabilityChartProps = {
  scores: {
    academic_strength: number;
    technical_skills: number;
    industry_readiness: number;
    resume_quality: number;
  };
};

export default function EmployabilityChart({ scores }: EmployabilityChartProps) {
  const data = [
    { label: "Academic", value: scores.academic_strength },
    { label: "Technical", value: scores.technical_skills },
    { label: "Industry", value: scores.industry_readiness },
    { label: "Resume", value: scores.resume_quality },
  ];

  return (
    <div className="h-64 w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <h3 className="text-base font-semibold text-white">Employability Breakdown</h3>
      <p className="text-sm text-slate-300">Placement readiness across key areas</p>
      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "#cbd5f5", fontSize: 12 }} />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                borderColor: "rgba(255,255,255,0.1)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#e2e8f0",
              }}
            />
            <Radar
              dataKey="value"
              stroke="#60a5fa"
              fill="#60a5fa"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
