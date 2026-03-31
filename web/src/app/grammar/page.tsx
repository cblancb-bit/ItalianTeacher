"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScoreBar from "@/components/ScoreBar";

interface MCItem {
  id: number;
  sentence: string;
  options: Record<string, string>;
  correct: string;
  grammar_point: string;
}

interface TransformItem {
  id: number;
  instruction: string;
  original: string;
  answer: string;
  hint: string;
}

interface Exercise {
  multiple_choice: MCItem[];
  transformations: TransformItem[];
}

export default function GrammarPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [mcAnswers, setMcAnswers] = useState<Record<number, string>>({});
  const [transformAnswers, setTransformAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    setLoading(true);
    setMcAnswers({});
    setTransformAnswers({});
    setSubmitted(false);
    setExercise(null);
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "grammar" }),
      });
      setExercise(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function mcScore() {
    if (!exercise) return 0;
    return exercise.multiple_choice.filter((q) => mcAnswers[q.id] === q.correct).length;
  }

  function totalScore() {
    if (!exercise) return 0;
    const mc = mcScore();
    return Math.round((mc / exercise.multiple_choice.length) * 20);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Analisi delle Strutture — Grammar
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Multiple choice grammar exercises and sentence transformations.
          Focus: subjunctive, conditional, passive, indirect speech.
          CILS B2: 20 points, minimum 11 to pass.
        </p>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
      >
        {exercise ? "New Exercise" : "Start Exercise"}
      </button>

      {loading && <LoadingSpinner text="Generating grammar exercise..." />}

      {exercise && !loading && (
        <div className="mt-6 space-y-8">
          {/* Multiple Choice */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Part A — Multiple Choice (choose the correct form)
            </h3>
            <div className="space-y-4">
              {exercise.multiple_choice.map((q) => {
                const selected = mcAnswers[q.id];
                const isCorrect = selected === q.correct;
                return (
                  <div
                    key={q.id}
                    className={`border rounded-lg p-4 ${
                      submitted
                        ? isCorrect
                          ? "border-green-400 bg-green-50"
                          : "border-red-400 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-800">
                        {q.id}. {q.sentence}
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2 whitespace-nowrap">
                        {q.grammar_point}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(q.options).map(([key, value]) => {
                        let cls =
                          "text-left px-3 py-2 rounded border text-sm transition-colors ";
                        if (!submitted) {
                          cls +=
                            selected === key
                              ? "border-blue-500 bg-blue-100"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                        } else {
                          if (key === q.correct)
                            cls += "border-green-500 bg-green-100 font-medium";
                          else if (key === selected)
                            cls += "border-red-500 bg-red-100";
                          else cls += "border-gray-200 opacity-60";
                        }
                        return (
                          <button
                            key={key}
                            disabled={submitted}
                            onClick={() =>
                              setMcAnswers((a) => ({ ...a, [q.id]: key }))
                            }
                            className={cls}
                          >
                            <span className="font-bold mr-2">{key}.</span>
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transformations */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Part B — Sentence Transformations
            </h3>
            <div className="space-y-4">
              {exercise.transformations.map((t) => (
                <div key={t.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <p className="text-sm text-gray-500 mb-1 italic">{t.instruction}</p>
                  <p className="font-medium text-gray-800 mb-3">
                    {t.id}. {t.original}
                  </p>
                  <input
                    type="text"
                    disabled={submitted}
                    value={transformAnswers[t.id] || ""}
                    onChange={(e) =>
                      setTransformAnswers((a) => ({ ...a, [t.id]: e.target.value }))
                    }
                    placeholder="Write your answer..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                  {submitted && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <span className="font-medium text-green-700">Model answer: </span>
                      <span className="text-green-800">{t.answer}</span>
                      <span className="text-gray-500 ml-2">({t.hint})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(mcAnswers).length < exercise.multiple_choice.length}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-40"
            >
              Submit Answers
            </button>
          ) : (
            <div className="space-y-2">
              <ScoreBar score={totalScore()} label="Your Score (based on multiple choice)" />
              <p className="text-sm text-gray-500">
                Transformations are self-assessed — compare your answers to the model answers above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
