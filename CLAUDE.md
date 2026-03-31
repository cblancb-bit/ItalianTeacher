# ItalianTeacher — CILS B2 Prep App

## Project
Next.js 14 app to help a French-speaking beginner-intermediate learner (A2-B1+) prepare for the CILS B2 Italian exam.

## Key URLs
- **Live app:** https://web-nine-zeta-80.vercel.app
- **GitHub:** https://github.com/cblancb-bit/ItalianTeacher
- **Vercel project:** cblancb-bits-projects/web

## Structure
```
web/                        # Next.js app (the only thing deployed)
  src/
    app/
      api/exercise/         # POST — generates exercises via Claude API
      api/feedback/         # POST — scores writing/speaking via Claude API
      listening/            # Ascolto section
      reading/              # Lettura section
      grammar/              # Analisi delle Strutture section
      writing/              # Produzione Scritta section
      speaking/             # Produzione Orale section
    lib/
      claude.ts             # Anthropic SDK client (max_tokens: 1024)
      cils-prompts.ts       # All AI prompts for each section
    components/
      FeedbackPanel.tsx     # Reusable AI feedback display
      ScoreBar.tsx          # Score out of 20 with pass/fail
      LoadingSpinner.tsx
```

## Deploying
```
cd C:/Users/cblan/source/repos/ItalianTeacher/web
npx vercel --prod
```

## Running locally
```
cd C:/Users/cblan/source/repos/ItalianTeacher/web
npx next dev
```

## Known issues
- Vercel hobby plan cold starts: first request sometimes fails, second always works
- Speaking section (Orale) requires Chrome or Edge — Web Speech API not supported in Safari/Firefox

## CILS B2 exam sections (each worth 20pts, min 11 to pass)
1. Ascolto — listening, 30 min
2. Lettura — reading, 50 min
3. Analisi delle Strutture — grammar, 60 min
4. Produzione Scritta — writing (2 tasks), 70 min
5. Produzione Orale — speaking (~10 min)

## Windows terminal notes
- Do NOT use && to chain commands — run them one at a time
- Always use full absolute paths: `C:/Users/cblan/source/repos/ItalianTeacher/web`
