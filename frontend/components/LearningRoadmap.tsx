"use client";

type RoadmapStage = { stage: string; topics: string[] };

type LearningRoadmapProps = {
  stages: RoadmapStage[];
};

export default function LearningRoadmap({ stages }: LearningRoadmapProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Learning Roadmap</h3>
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.stage} className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-700">{stage.stage}</p>
            <p className="mt-2 text-xs text-slate-500">{stage.topics.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
