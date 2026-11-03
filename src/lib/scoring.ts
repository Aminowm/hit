import type { ExamId } from './types';

/**
 * Score estimators.
 *
 * IMPORTANT: College Board does not publish exact conversion tables for the
 * adaptive Digital SAT (it uses item-response theory, so *which* questions you
 * miss matters) or the cut scores for AP exams. These curves are approximations
 * built from released practice tests and historical score distributions. They
 * are good for tracking direction and "mistake budgets", not for promises.
 */

type Anchor = [raw: number, scaled: number];

/** Piecewise-linear interpolation over ascending anchors. */
export function interpolate(anchors: Anchor[], x: number): number {
  if (x <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i];
    if (x <= x1) {
      const [x0, y0] = anchors[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return last[1];
}

const roundTo10 = (n: number) => Math.round(n / 10) * 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export type SatRoute = 'harder' | 'easier';
export const SAT_RW_MAX = 54;
export const SAT_MATH_MAX = 44;

// Raw = total correct across both modules of a section.
const SAT_CURVES: Record<'rw' | 'math', Record<SatRoute, Anchor[]>> = {
  rw: {
    harder: [
      [0, 200], [5, 270], [10, 340], [15, 400], [20, 460], [25, 510], [30, 560], [34, 590], [37, 620], [40, 650],
      [42, 670], [44, 690], [45, 700], [46, 710], [47, 720], [48, 730], [49, 740], [50, 750], [51, 760], [52, 770],
      [53, 790], [54, 800],
    ],
    easier: [
      [0, 200], [5, 240], [10, 280], [15, 320], [20, 360], [25, 400], [30, 440], [35, 480], [40, 520], [45, 560],
      [50, 600], [54, 640],
    ],
  },
  math: {
    harder: [
      [0, 200], [5, 330], [10, 430], [14, 480], [18, 520], [22, 560], [25, 590], [28, 620], [30, 640], [32, 660],
      [33, 670], [34, 680], [35, 690], [36, 700], [37, 710], [38, 720], [39, 740], [40, 750], [41, 760], [42, 770],
      [43, 790], [44, 800],
    ],
    easier: [
      [0, 200], [5, 260], [10, 320], [15, 370], [20, 420], [25, 460], [30, 510], [35, 560], [40, 610], [44, 650],
    ],
  },
};

export function estimateSatSection(section: 'rw' | 'math', raw: number, route: SatRoute): number {
  const max = section === 'rw' ? SAT_RW_MAX : SAT_MATH_MAX;
  const r = clamp(Math.round(raw), 0, max);
  return clamp(roundTo10(interpolate(SAT_CURVES[section][route], r)), 200, 800);
}

export function estimateSat(rwRaw: number, mathRaw: number, rwRoute: SatRoute, mathRoute: SatRoute) {
  const rw = estimateSatSection('rw', rwRaw, rwRoute);
  const math = estimateSatSection('math', mathRaw, mathRoute);
  return { rw, math, total: rw + math };
}

/** Max questions you can miss (on the harder route) and still reach `scaled` in a section. */
export function satMissBudget(section: 'rw' | 'math', scaled: number): number {
  const max = section === 'rw' ? SAT_RW_MAX : SAT_MATH_MAX;
  for (let raw = 0; raw <= max; raw++) {
    if (estimateSatSection(section, raw, 'harder') >= scaled) return max - raw;
  }
  return -1; // unreachable
}

export interface SatSplit {
  rw: number;
  math: number;
  rwMisses: number;
  mathMisses: number;
}

/** All realistic (R&W, Math) splits that reach the target total, with miss budgets. */
export function satTargetSplits(target: number): SatSplit[] {
  const t = clamp(roundTo10(target), 400, 1600);
  const out: SatSplit[] = [];
  for (let rw = 200; rw <= 800; rw += 10) {
    const math = t - rw;
    if (math < 200 || math > 800) continue;
    out.push({ rw, math, rwMisses: satMissBudget('rw', rw), mathMisses: satMissBudget('math', math) });
  }
  return out;
}

// ---------------------------------------------------------------- AP

export interface ApFrq {
  label: string;
  max: number;
}

export interface ApFormat {
  mcq: number;
  frq: ApFrq[];
  /** Minimum composite percentage for each score (approximate, historical). */
  cutoffs: { 5: number; 4: number; 3: number; 2: number };
  note: string;
}

const PHYSICS_FRQ: ApFrq[] = [
  { label: 'Mathematical Routines', max: 10 },
  { label: 'Translation Between Representations', max: 12 },
  { label: 'Experimental Design & Analysis', max: 10 },
  { label: 'Qualitative/Quantitative Translation', max: 10 },
];

export const AP_FORMATS: Partial<Record<ExamId, ApFormat>> = {
  calcbc: {
    mcq: 42,
    frq: [
      { label: 'FRQ 1 · calculator', max: 9 },
      { label: 'FRQ 2 · calculator', max: 9 },
      { label: 'FRQ 3', max: 9 },
      { label: 'FRQ 4', max: 9 },
      { label: 'FRQ 5', max: 9 },
      { label: 'FRQ 6', max: 9 },
    ],
    cutoffs: { 5: 63, 4: 49, 3: 37, 2: 27 },
    note: 'Historically a 5 needed roughly 63% of the composite (≈ 68/108 points).',
  },
  phys1: {
    mcq: 40,
    frq: PHYSICS_FRQ,
    cutoffs: { 5: 70, 4: 55, 3: 41, 2: 28 },
    note: 'Cut scores for the redesigned (2025+) exam are not public; these follow historical Physics 1 curves.',
  },
  physc: {
    mcq: 40,
    frq: PHYSICS_FRQ,
    cutoffs: { 5: 58, 4: 45, 3: 34, 2: 24 },
    note: 'Physics C has historically had a generous curve — a 5 has needed well under 60%.',
  },
};

export function apCompositePercent(exam: ExamId, mcqCorrect: number, frqPoints: number[]): number {
  const f = AP_FORMATS[exam];
  if (!f) return 0;
  const frqMax = f.frq.reduce((s, q) => s + q.max, 0);
  const frqGot = f.frq.reduce((s, q, i) => s + clamp(frqPoints[i] ?? 0, 0, q.max), 0);
  const mcq = clamp(mcqCorrect, 0, f.mcq);
  return 50 * (mcq / f.mcq) + 50 * (frqGot / frqMax);
}

export function apScoreFromPercent(exam: ExamId, percent: number): 1 | 2 | 3 | 4 | 5 {
  const f = AP_FORMATS[exam];
  if (!f) return 1;
  const c = f.cutoffs;
  if (percent >= c[5]) return 5;
  if (percent >= c[4]) return 4;
  if (percent >= c[3]) return 3;
  if (percent >= c[2]) return 2;
  return 1;
}

/** FRQ points still needed for `score`, given an MCQ result. Returns 0 if already there, null if impossible. */
export function apFrqPointsNeeded(exam: ExamId, mcqCorrect: number, score: 2 | 3 | 4 | 5): number | null {
  const f = AP_FORMATS[exam];
  if (!f) return null;
  const frqMax = f.frq.reduce((s, q) => s + q.max, 0);
  const mcqPart = 50 * (clamp(mcqCorrect, 0, f.mcq) / f.mcq);
  const needPct = f.cutoffs[score] - mcqPart;
  if (needPct <= 0) return 0;
  const pts = Math.ceil((needPct / 50) * frqMax - 1e-9);
  return pts > frqMax ? null : pts;
}
