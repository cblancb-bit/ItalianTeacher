"use client";

import { useState, useRef, useEffect } from "react";
import { SPEAKING_TOPICS } from "@/lib/cils-prompts";
import FeedbackPanel from "@/components/FeedbackPanel";
import LoadingSpinner from "@/components/LoadingSpinner";

// Browser SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface FeedbackData {
  score: number;
  grade: string;
  overall_feedback: string;
  content_score: number;
  fluency_score: number;
  grammar_score: number;
  vocabulary_score: number;
  strengths: string[];
  corrections: { original: string; corrected: string; explanation: string }[];
  suggested_phrases: string[];
  model_response_excerpt: string;
}

export default function SpeakingPage() {
  const [topicIndex, setTopicIndex] = useState(0);
  const [phase, setPhase] = useState<"ready" | "prep" | "recording" | "done">("ready");
  const [prepSeconds, setPrepSeconds] = useState(60);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const topic = SPEAKING_TOPICS[topicIndex];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  function startPrep() {
    setPhase("prep");
    setPrepSeconds(60);
    timerRef.current = setInterval(() => {
      setPrepSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          startRecording();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function startRecording() {
    setPhase("recording");
    setTranscript("");
    setInterimText("");

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      setPhase("ready");
      return;
    }

    const recognition = new SR();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      setTranscript(final);
      setInterimText(interim);
    };

    recognition.onerror = () => {
      setError("Microphone error. Please allow microphone access and try again.");
      setPhase("ready");
    };

    recognition.onend = () => {
      if (phase === "recording") setPhase("done");
    };

    recognition.start();
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setPhase("done");
  }

  async function submitForFeedback() {
    if (!transcript.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "speaking", topic, transcript }),
      });
      setFeedback(await res.json());
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    setPhase("ready");
    setTranscript("");
    setInterimText("");
    setFeedback(null);
    setError("");
  }

  function nextTopic() {
    reset();
    setTopicIndex((i) => (i + 1) % SPEAKING_TOPICS.length);
  }

  function speakTopic() {
    const u = new SpeechSynthesisUtterance(topic);
    u.lang = "it-IT";
    u.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const itVoice = voices.find((v) => v.lang.startsWith("it"));
    if (itVoice) u.voice = itVoice;
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produzione Orale — Speaking</h1>
        <p className="text-gray-500 text-sm mt-1">
          You get 60 seconds to prepare, then speak for 2-3 minutes on the topic.
          AI evaluates content, fluency, grammar, and vocabulary.
          CILS B2: 20 points, minimum 11 to pass.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Topic Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Topic {topicIndex + 1} of {SPEAKING_TOPICS.length}
          </span>
          <button
            onClick={speakTopic}
            className="text-xs text-blue-600 border border-blue-300 px-2 py-1 rounded hover:bg-blue-100"
          >
            ▶ Listen (IT)
          </button>
        </div>
        <p className="text-lg font-medium text-gray-800 mt-1">{topic}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={nextTopic}
            disabled={phase !== "ready"}
            className="text-sm text-blue-700 underline disabled:opacity-40"
          >
            Different topic
          </button>
        </div>
      </div>

      {/* CILS B2 Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
        <strong>CILS B2 Speaking Format:</strong>
        <ul className="mt-1 list-disc list-inside space-y-1">
          <li>Part 1: Interactive conversation with examiner (respond & engage)</li>
          <li>Part 2: Individual presentation — speak for ~2 minutes on the assigned topic</li>
        </ul>
      </div>

      {/* Controls */}
      {phase === "ready" && (
        <button
          onClick={startPrep}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 text-base"
        >
          Start (60s Prep Time)
        </button>
      )}

      {phase === "prep" && (
        <div className="text-center space-y-4">
          <div className="text-6xl font-mono font-bold text-blue-600">{prepSeconds}</div>
          <p className="text-gray-600">Preparation time — recording starts automatically</p>
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              startRecording();
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Start Speaking Now
          </button>
        </div>
      )}

      {phase === "recording" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium text-red-700">Recording... Speak in Italian</span>
            <button
              onClick={stopRecording}
              className="ml-auto bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700"
            >
              Stop
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 min-h-[100px] bg-white text-sm text-gray-700">
            {transcript}
            <span className="text-gray-400 italic">{interimText}</span>
            {!transcript && !interimText && (
              <span className="text-gray-400">Your speech will appear here...</span>
            )}
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Your Transcript</h3>
            <p className="text-gray-800 text-sm leading-relaxed">
              {transcript || "No speech detected."}
            </p>
          </div>

          {!feedback && !submitting && (
            <div className="flex gap-3">
              <button
                onClick={submitForFeedback}
                disabled={!transcript.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40"
              >
                Get AI Feedback
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          )}

          {submitting && <LoadingSpinner text="Evaluating your speaking..." />}

          {feedback && (
            <>
              {/* Score breakdown */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                {[
                  { label: "Content", val: feedback.content_score },
                  { label: "Fluency", val: feedback.fluency_score },
                  { label: "Grammar", val: feedback.grammar_score },
                  { label: "Vocabulary", val: feedback.vocabulary_score },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{val}/5</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>

              <FeedbackPanel data={feedback} />

              <button
                onClick={reset}
                className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50"
              >
                Practice Again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
