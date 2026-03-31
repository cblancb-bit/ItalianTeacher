import Link from "next/link";

const sections = [
  {
    href: "/listening",
    emoji: "🎧",
    title: "Ascolto",
    subtitle: "Listening",
    duration: "30 min",
    points: "20 pts",
    description: "Listen to Italian passages and answer comprehension questions.",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    href: "/reading",
    emoji: "📖",
    title: "Lettura",
    subtitle: "Reading",
    duration: "50 min",
    points: "20 pts",
    description: "Read Italian texts, answer comprehension and cloze questions.",
    color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    href: "/grammar",
    emoji: "✏️",
    title: "Analisi delle Strutture",
    subtitle: "Grammar",
    duration: "60 min",
    points: "20 pts",
    description: "Multiple choice grammar + sentence transformations. Focus: subjunctive, conditional, passive.",
    color: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
    badge: "bg-yellow-100 text-yellow-700",
  },
  {
    href: "/writing",
    emoji: "📝",
    title: "Produzione Scritta",
    subtitle: "Writing",
    duration: "70 min",
    points: "20 pts",
    description: "Two tasks: description/review (120-140 words) + formal or informal letter (80-100 words). AI feedback.",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    href: "/speaking",
    emoji: "🎤",
    title: "Produzione Orale",
    subtitle: "Speaking",
    duration: "~10 min",
    points: "20 pts",
    description: "Speak on a topic for 2-3 minutes. AI transcribes and scores content, fluency, grammar, vocabulary.",
    color: "bg-red-50 border-red-200 hover:border-red-400",
    badge: "bg-red-100 text-red-700",
  },
];

export default function HomePage() {
  return (
    <div className="px-4 py-10 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🇮🇹</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CILS B2 Italian Exam Prep</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          AI-powered practice for all 5 sections of the CILS B2 exam.
          Each section is worth 20 points — you need at least 11 per section to pass.
        </p>
      </div>

      {/* Passing Rule Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-8 flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="text-sm text-amber-800">
          <strong>CILS B2 Passing Rule:</strong> You must score at least 11/20 in{" "}
          <em>every single section</em>. A high score in one section cannot compensate for a fail in
          another. Total minimum: 55/100.
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`border-2 rounded-xl p-5 transition-all ${s.color} group`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-bold text-gray-900">{s.title}</span>
                </div>
                <span className="text-sm text-gray-500">{s.subtitle}</span>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
                  {s.points}
                </div>
                <div className="text-xs text-gray-400 mt-1">{s.duration}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{s.description}</p>
            <div className="mt-3 text-sm font-medium text-gray-700 group-hover:underline">
              Practice now →
            </div>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-10 bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Key B2 Grammar Topics to Master</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
          {[
            "Congiuntivo presente",
            "Congiuntivo passato",
            "Congiuntivo imperfetto",
            "Congiuntivo trapassato",
            "Condizionale presente",
            "Condizionale passato",
            "Periodo ipotetico",
            "Forma passiva",
            "Discorso indiretto",
            "Pronomi relativi",
            "Connettivi logici",
            "Tempi del passato",
          ].map((topic) => (
            <div key={topic} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
              {topic}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Powered by Claude AI · Exam format: CILS DUE B2 (Università per Stranieri di Siena)
      </p>
    </div>
  );
}
