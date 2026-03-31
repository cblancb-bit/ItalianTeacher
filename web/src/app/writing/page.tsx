"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import FeedbackPanel from "@/components/FeedbackPanel";

interface WritingTask {
  task_type: string;
  prompt: string;
  word_target: string;
  model_answer: string;
  evaluation_criteria: string[];
}

interface FeedbackData {
  score: number;
  grade: string;
  overall_feedback: string;
  strengths: string[];
  corrections: { original: string; corrected: string; explanation: string }[];
  vocabulary_suggestions: string[];
  revised_version: string;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function TaskBlock({
  taskKey,
  label,
}: {
  taskKey: "writing1" | "writing2";
  label: string;
}) {
  const [task, setTask] = useState<WritingTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showModel, setShowModel] = useState(false);

  async function generate() {
    setLoading(true);
    setAnswer("");
    setFeedback(null);
    setShowModel(false);
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: taskKey }),
      });
      setTask(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!task || !answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "writing", task: task.prompt, answer, wordTarget: task.word_target }),
      });
      setFeedback(await res.json());
    } finally {
      setSubmitting(false);
    }
  }

  const wc = countWords(answer);
  const [min, max] = task?.word_target.split("-").map(Number) ?? [0, 999];
  const wcOk = wc >= min && wc <= max;

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{label}</h3>
        <button
          onClick={generate}
          disabled={loading}
          className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {task ? "New Task" : "Get Task"}
        </button>
      </div>

      {loading && <LoadingSpinner text="Generating task..." />}

      {task && !loading && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded font-medium uppercase">
                {task.task_type.replace("_", " ")}
              </span>
              <span className="text-xs text-gray-500">Target: {task.word_target} words</span>
            </div>
            <p className="text-gray-800 text-sm mt-2">{task.prompt}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Evaluation Criteria
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {task.evaluation_criteria.map((c, i) => (
                <li key={i} className="text-xs text-gray-600">{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!feedback}
              rows={8}
              placeholder="Scrivi la tua risposta qui..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
            <div className={`text-right text-xs mt-1 ${wcOk ? "text-green-600" : "text-orange-500"}`}>
              {wc} words (target: {task.word_target})
            </div>
          </div>

          {!feedback ? (
            <button
              onClick={submit}
              disabled={submitting || answer.trim().length < 10}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 text-sm"
            >
              {submitting ? "Getting feedback..." : "Submit for AI Feedback"}
            </button>
          ) : (
            <>
              <FeedbackPanel data={feedback} />
              <button
                onClick={() => setShowModel(!showModel)}
                className="text-sm text-purple-700 underline"
              >
                {showModel ? "Hide" : "Show"} model answer
              </button>
              {showModel && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm text-gray-800 leading-relaxed">
                  {task.model_answer}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function WritingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produzione Scritta — Writing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Two writing tasks with AI feedback. Task 1: description/narration/review (120-140 words).
          Task 2: formal or informal letter (80-100 words). CILS B2: 20 points each, minimum 11 to pass.
        </p>
      </div>
      <div className="space-y-6">
        <TaskBlock taskKey="writing1" label="Task 1 — Description / Narration / Review" />
        <TaskBlock taskKey="writing2" label="Task 2 — Formal or Informal Letter" />
      </div>
    </div>
  );
}
