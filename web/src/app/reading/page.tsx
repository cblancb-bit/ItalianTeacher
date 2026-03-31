"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScoreBar from "@/components/ScoreBar";

interface MCQuestion {
  id: number;
  question: string;
  options: Record<string, string>;
  correct: string;
}

interface ClozeQuestion {
  id: number;
  sentence: string;
  options: Record<string, string>;
  correct: string;
}

interface Exercise {
  topic: string;
  passage: string;
  comprehension: MCQuestion[];
  cloze: ClozeQuestion[];
}

export default function ReadingPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setExercise(null);
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "reading" }),
      });
      setExercise(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function score() {
    if (!exercise) return 0;
    const all = [...exercise.comprehension, ...exercise.cloze];
    let correct = 0;
    all.forEach((q) => { if (answers[q.id] === q.correct) correct++; });
    return Math.round((correct / all.length) * 20);
  }

  function renderQuestions(questions: (MCQuestion | ClozeQuestion)[], title: string) {
    return (
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">{title}</h3>
        <div className="space-y-4">
          {questions.map((q) => {
            const selected = answers[q.id];
            const isCorrect = selected === q.correct;
            const label = "question" in q ? q.question : q.sentence;
            return (
              <div
                key={q.id}
                className={`border rounded-lg p-4 ${
                  submitted
                    ? isCorrect ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="font-medium text-gray-800 mb-3">{q.id}. {label}</p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(q.options).map(([key, value]) => {
                    let cls = "text-left px-3 py-2 rounded border text-sm transition-colors ";
                    if (!submitted) {
                      cls += selected === key
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                    } else {
                      if (key === q.correct) cls += "border-green-500 bg-green-100 font-medium";
                      else if (key === selected) cls += "border-red-500 bg-red-100";
                      else cls += "border-gray-200 opacity-60";
                    }
                    return (
                      <button
                        key={key}
                        disabled={submitted}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: key }))}
                        className={cls}
                      >
                        <span className="font-bold mr-2">{key}.</span>{value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const totalQuestions = exercise
    ? exercise.comprehension.length + exercise.cloze.length
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lettura — Reading</h1>
        <p className="text-gray-500 text-sm mt-1">
          Read the passage, answer comprehension questions and cloze exercises.
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

      {loading && <LoadingSpinner text="Generating reading exercise..." />}

      {exercise && !loading && (
        <div className="mt-6 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-800 mb-3">{exercise.topic}</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{exercise.passage}</p>
          </div>

          {renderQuestions(exercise.comprehension, "Part A — Comprehension")}
          {renderQuestions(exercise.cloze, "Part B — Cloze")}

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < totalQuestions}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-40"
            >
              Submit Answers
            </button>
          ) : (
            <ScoreBar score={score()} label="Your Score" />
          )}
        </div>
      )}
    </div>
  );
}
