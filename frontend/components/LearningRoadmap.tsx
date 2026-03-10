"use client";

type RoadmapStage = { stage: string; topics: string[] };

type LearningRoadmapProps = {
  stages: RoadmapStage[];
};

export default function LearningRoadmap({ stages }: LearningRoadmapProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <h3 className="mb-4 text-base font-semibold text-white">Learning Roadmap</h3>
      <div className="space-y-5">
        {stages.map((stage, index) => (
          <div key={stage.stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900">
                {index + 1}
              </div>
              {index < stages.length - 1 ? (
                <div className="mt-2 h-full w-px bg-white/20" />
              ) : null}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{stage.stage}</p>
              <p className="mt-2 text-xs text-slate-300">{stage.topics.join(", ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
