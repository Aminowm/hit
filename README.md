# Lyceum — SAT · AP Study Desk

A personal study dashboard for the **Digital SAT** (target 1550, Dec 5 2026), **AP Calculus BC** (May 10 2027),
**AP Physics C: Mechanics** (May 3 2027) and **AP Physics 1**. It runs entirely in your browser, with no account
and no server; your progress is saved locally and can be exported as a backup.

## What's inside

| Page | What it does |
|---|---|
| **Dashboard** | Exam countdowns and weighted mastery, a ranked "Study next" list, today's tasks, weekly study chart, streak, registration deadlines and a roadmap built from your exam dates |
| **Library** | 50+ curated resources (official College Board material, Barron's, Princeton Review, 5 Steps, Erica Meltzer, College Panda, Stewart, Halliday/Resnick, Giancoli, OpenStax, Flipping Physics, Paul's Notes…), each with a "how to use it" tip. Filter, search, track what you're using, add your own |
| **Topic Tracker** | Every unit and skill from the official College Board frameworks, with exam weightings. 4-step status per topic |
| **Formula Sheets** | KaTeX-rendered formulas marked *on the reference sheet* vs *memorize*, with search, copy-LaTeX and print |
| **Flashcards** | Spaced repetition (SM-2) on every formula plus key concepts and FRQ justifications; add your own cards with math |
| **Practice Log** | Log full tests, sections, FRQ sets and question sets; SAT and AP trend charts; past-FRQ archive checklist |
| **Mistake Log** | Tag each miss (concept gap, careless, misread, time…), write the fix, re-attempt later; see your patterns |
| **Score Estimator** | SAT raw → scaled (harder/easier Module 2), "mistake budget" for your target, AP composite → 1–5 with FRQ points needed for a 5 |
| **Planner** | Weekly task board, "Suggest this week" generator from your roadmap phase, manual study-time log |
| **Timer** | Pomodoro that logs focus time per exam, and a mock-exam timer with official section timings (May 2027 Calc BC format) |
| **Settings** | Exam dates and targets, theme (light/dark/system), goals, JSON backup export/import |

## Run it locally

Requires Node 20.19+ (22 recommended).

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

```bash
npm test
```

```bash
npm run build
```

## Deploy (free) to GitHub Pages

1. Push to `main`.
2. In the repository: **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) tests, builds and publishes the site.

The build uses relative paths and hash routing, so the `dist/` folder also works on Netlify, Vercel or any static host.

## Your data

Everything lives in this browser's `localStorage`. Use **Settings → Export backup** regularly, and **Import backup** to
move to another computer. Clearing site data erases your progress.

## Editing the content

All study content is plain TypeScript data in `src/data/` — add a resource, a topic or a formula and it appears
everywhere (flashcards are generated from formulas automatically). See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Accuracy notes

- Exam dates and formats reflect the 2026–27 cycle; confirm on College Board (dates are editable in Settings).
- Score conversions are **estimates**: the Digital SAT is adaptive and scored with item-response theory, and AP cut scores
  are not published. They are useful for trends and margins, not guarantees.
- The library links to official sites and publishers; no copyrighted material is hosted.
