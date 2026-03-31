import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CILS B2 Italian Prep",
  description: "Practice all 5 sections of the CILS B2 Italian language exam with AI",
};

const nav = [
  { href: "/", label: "Home", emoji: "🇮🇹" },
  { href: "/listening", label: "Ascolto", emoji: "🎧" },
  { href: "/reading", label: "Lettura", emoji: "📖" },
  { href: "/grammar", label: "Grammatica", emoji: "✏️" },
  { href: "/writing", label: "Scrittura", emoji: "📝" },
  { href: "/speaking", label: "Orale", emoji: "🎤" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 h-14 overflow-x-auto">
            {nav.map(({ href, label, emoji }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
        <main className="max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
