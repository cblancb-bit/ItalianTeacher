"use client";

import ScoreBar from "./ScoreBar";

interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

interface FeedbackData {
  score: number;
  grade: string;
  overall_feedback: string;
  strengths?: string[];
  corrections?: Correction[];
  vocabulary_suggestions?: string[];
  suggested_phrases?: string[];
  revised_version?: string;
  model_response_excerpt?: string;
}

export default function FeedbackPanel({ data }: { data: FeedbackData }) {
  return (
    <div className="space-y-4 mt-6 border-t pt-6">
      <ScoreBar score={data.score} label="Your Score" />

      <div className={`rounded-lg p-4 ${data.grade === "Pass" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
        <p className="font-medium text-gray-800">{data.overall_feedback}</p>
      </div>

      {data.strengths && data.strengths.length > 0 && (
        <div>
          <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
          <ul className="list-disc list-inside space-y-1">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-700">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {data.corrections && data.corrections.length > 0 && (
        <div>
          <h4 className="font-semibold text-red-700 mb-2">Corrections</h4>
          <div className="space-y-2">
            {data.corrections.map((c, i) => (
              <div key={i} className="bg-white rounded border p-3 text-sm">
                <div className="line-through text-red-500">{c.original}</div>
                <div className="text-green-600 font-medium">{c.corrected}</div>
                <div className="text-gray-500 mt-1">{c.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.vocabulary_suggestions || data.suggested_phrases) && (
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">Useful Phrases & Vocabulary</h4>
          <ul className="list-disc list-inside space-y-1">
            {(data.vocabulary_suggestions || data.suggested_phrases || []).map((p, i) => (
              <li key={i} className="text-sm text-gray-700 italic">{p}</li>
            ))}
          </ul>
        </div>
      )}

      {(data.revised_version || data.model_response_excerpt) && (
        <div>
          <h4 className="font-semibold text-purple-700 mb-2">
            {data.revised_version ? "Revised Version" : "Model Response"}
          </h4>
          <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm text-gray-800 leading-relaxed">
            {data.revised_version || data.model_response_excerpt}
          </div>
        </div>
      )}
    </div>
  );
}
