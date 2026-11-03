# Lyceum — architecture

A single-user study dashboard for the Digital SAT, AP Calculus BC, AP Physics C: Mechanics and AP Physics 1.
It is a static single-page app: no server, no account, all progress stored in the browser.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Build | Vite + TypeScript (strict) | Fast dev server, static output that runs on any host |
| UI | React 19 + Tailwind CSS v4 | Component model + design tokens in CSS |
| Routing | `createHashRouter` (React Router 7) | Works on GitHub Pages with no server rewrites |
| State | Zustand + `persist` → `localStorage` | Tiny, synchronous, survives reloads; export/import as JSON |
| Math | KaTeX | Fast, high-quality formula typesetting with MathML for screen readers |
| Icons / fonts | lucide-react; Source Serif 4, Inter, JetBrains Mono (self-hosted via Fontsource) | No runtime calls to third-party CDNs |
| Tests | Vitest | Pure-logic unit tests (`src/lib/*.test.ts`) |

## Folder structure

```
src/
  main.tsx, App.tsx          entry + lazy-loaded routes (one chunk per page)
  index.css                  design tokens (light/dark), Tailwind theme, base styles
  data/                      static content — edit these to change what the app teaches
    exams.ts                 dates, formats, section timings, deadlines
    topics/                  course frameworks → topic trackers (stable ids!)
    resources.ts             the library
    formulas/                formula sheets (KaTeX), "on sheet" vs "memorize"
    cards.ts                 flashcards (auto-generated from formulas + concept cards)
    frqArchive.ts            released FRQ years per AP exam
  lib/                       pure logic, no React — fully unit-tested
    scoring.ts               SAT raw→scaled curves, AP composite & cutoffs, mistake budgets
    srs.ts                   spaced repetition (SM-2 variant)
    progress.ts              mastery maths + "study next" ranking
    roadmap.ts               periodized plan from exam dates
    planner.ts               "suggest this week" task generator
    stats.ts, dates.ts, tex.ts, types.ts
  store/
    useStore.ts              persisted app data + actions, import/export normalization
    useTimer.ts              Pomodoro + mock-exam timers (persisted; ticked from the shell)
    selectors.ts             derived hooks (active exams, study queue, focus queue, roadmap)
    useThemeSync.ts          theme preference → <html data-theme>
  components/                ui primitives, charts (SVG), KaTeX renderer, layout shell
  pages/                     one file per route
```

## Data model (persisted under `localStorage["lyceum-v1"]`)

- `settings` — name, theme, per-exam `{ active, date, target }`, Pomodoro, goals
- `topics` — `{ [topicId]: { status, updated } }` (`not-started → learning → practiced → mastered`)
- `resourceStatus`, `customResources` — library shelf
- `practice` — scored practice entries (SAT section scores, AP composite %, or correct/total)
- `frqDone` — `{ "calcbc-2024-3": true }`
- `mistakes` — tagged mistake log linked to topic ids
- `tasks`, `sessions` — planner tasks and logged study minutes
- `customCards`, `srs` — user flashcards and review state for every card

`normalizeData()` merges stored/imported data over defaults, so adding a field later never breaks old backups.
Topic, formula and card ids are **stable keys** — append new items rather than renumbering.

## Key algorithms

- **Study next** = `unit weight × (1 − mastery) × urgency`, where urgency = `1 + 30 / max(days left, 7)`.
  SAT domain weights count half (each section is half the total score).
- **Roadmap** = SAT sprint (until the SAT) → AP content build → FRQ season (70 → 21 days before the first AP exam) → mocks & review.
- **Spaced repetition** = SM-2 style: ease 1.3–3.0, again/hard/good/easy, daily new-card limit, exams interleaved.
- **Score estimates** are deliberately labelled approximations (College Board doesn't publish adaptive SAT tables or AP cut scores).

## Visual system

"Academic minimal": warm paper background, ink text, serif headings, one oxblood accent.
Exam identity colours come from a categorical palette validated for colour-vision deficiency in both
themes; colour is never the only signal (every dot sits next to a label). Charts follow one spec:
2 px lines, ≥ 8 px markers with a surface ring, hairline gridlines, ≤ 24 px bars with rounded data ends,
a hover/focus tooltip on every mark, and a legend whenever there are two or more series.
