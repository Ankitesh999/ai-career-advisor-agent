"use client";

type RoadmapStage = { stage: string; topics: string[] };

type LearningRoadmapProps = {
  stages: RoadmapStage[];
};

export default function LearningRoadmap({ stages }: LearningRoadmapProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-900">Learning Roadmap</h3>
      <div className="space-y-5">
        {stages.map((stage, index) => (
          <div key={stage.stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {index + 1}
              </div>
              {index < stages.length - 1 ? (
                <div className="mt-2 h-full w-px bg-slate-200" />
              ) : null}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">{stage.stage}</p>
              <p className="mt-2 text-xs text-slate-600">{stage.topics.join(", ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
