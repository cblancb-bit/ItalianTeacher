"use client";

interface Props {
  score: number;
  maxScore?: number;
  label?: string;
}

export default function ScoreBar({ score, maxScore = 20, label }: Props) {
  const pct = Math.round((score / maxScore) * 100);
  const pass = score >= 11;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className={`font-bold ${pass ? "text-green-600" : "text-red-600"}`}>
            {score}/{maxScore} — {pass ? "PASS" : "FAIL"}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${pass ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">Minimum to pass: 11/{maxScore}</div>
    </div>
  );
}
