"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ScoreBar from "@/components/ScoreBar";

interface Question {
  id: number;
  question: string;
  options: Record<string, string>;
  correct: string;
}

interface Exercise {
  topic: string;
  passage: string;
  questions: Question[];
}

export default function ListeningPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  async function generate() {
    setLoading(true);
    setAnswers({});
    setSubmitted(false);
    setExercise(null);
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "listening" }),
      });
      const data = await res.json();
      setExercise(data);
    } finally {
      setLoading(false);
    }
  }

  function speak() {
    if (!exercise) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(exercise.passage);
    utterance.lang = "it-IT";
    utterance.rate = 0.9;

    // Try to find an Italian voice
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find((v) => v.lang.startsWith("it"));
    if (italianVoice) utterance.voice = italianVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function score() {
    if (!exercise) return 0;
    let correct = 0;
    exercise.questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    return Math.round((correct / exercise.questions.length) * 20);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ascolto — Listening</h1>
        <p className="text-gray-500 text-sm mt-1">
          Listen to the passage (read aloud by the browser), then answer 6 comprehension questions.
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

      {loading && <LoadingSpinner text="Generating listening exercise..." />}

      {exercise && !loading && (
        <div className="mt-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-800 mb-2">Topic: {exercise.topic}</h2>
            <div className="flex gap-3">
              <button
                onClick={speaking ? stopSpeaking : speak}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${
                  speaking
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {speaking ? (
                  <>
                    <span className="w-3 h-3 bg-white rounded-sm inline-block" />
                    Stop
                  </>
                ) : (
                  <>
                    <span>▶</span> Play Passage
                  </>
                )}
              </button>
              {speaking && (
                <div className="flex items-center gap-1 text-blue-600 text-sm animate-pulse">
                  <span>●</span> Playing in Italian...
                </div>
              )}
            </div>
            {submitted && (
              <details className="mt-3">
                <summary className="text-blue-700 cursor-pointer text-sm font-medium">
                  Show passage text
                </summary>
                <p className="mt-2 text-gray-700 text-sm leading-relaxed">{exercise.passage}</p>
              </details>
            )}
          </div>

          <div className="space-y-4">
            {exercise.questions.map((q) => {
              const selected = answers[q.id];
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
                  <p className="font-medium text-gray-800 mb-3">
                    {q.id}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(q.options).map(([key, value]) => {
                      let btnClass =
                        "text-left px-3 py-2 rounded border text-sm transition-colors ";
                      if (!submitted) {
                        btnClass +=
                          selected === key
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                      } else {
                        if (key === q.correct) {
                          btnClass += "border-green-500 bg-green-100 font-medium";
                        } else if (key === selected && selected !== q.correct) {
                          btnClass += "border-red-500 bg-red-100";
                        } else {
                          btnClass += "border-gray-200 opacity-60";
                        }
                      }
                      return (
                        <button
                          key={key}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: key }))}
                          className={btnClass}
                        >
                          <span className="font-bold mr-2">{key}.</span> {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!submitted ? (
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(answers).length < exercise.questions.length}
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
