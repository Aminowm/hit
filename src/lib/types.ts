/** Core domain types shared by data files, the store and the UI. */

export type ExamId = 'sat' | 'calcbc' | 'phys1' | 'physc';

export interface ExamSection {
  name: string;
  minutes: number;
  questions?: number;
  /** Shown under the section name in the mock-exam timer (e.g. "No calculator"). */
  note?: string;
  isBreak?: boolean;
}

export interface ExamDeadline {
  label: string;
  date: string; // YYYY-MM-DD
}

export interface ExamDef {
  id: ExamId;
  name: string;
  short: string;
  /** Score scale label, e.g. "400–1600" or "1–5". */
  scale: string;
  defaultDate: string | null;
  defaultTarget: number;
  /** Whether the date is confirmed by College Board (unconfirmed dates get a hint in the UI). */
  dateConfirmed: boolean;
  sections: ExamSection[];
  facts: string[];
  deadlines: ExamDeadline[];
  officialUrl: string;
}

// ---------- Topic tracker ----------

export type TopicStatus = 'not-started' | 'learning' | 'practiced' | 'mastered';

export interface Topic {
  id: string;
  code?: string;
  title: string;
  /** Short coaching hint (what to know / common trap). */
  hint?: string;
}

export interface Unit {
  id: string;
  code: string;
  title: string;
  /** Exam weighting range in percent, relative to `weightOf` (whole exam if omitted). */
  weight: [number, number];
  /** For SAT: weights are relative to one section, which is half of the total score. */
  section?: 'Reading & Writing' | 'Math';
  badge?: string;
  topics: Topic[];
}

export interface Course {
  exam: ExamId;
  title: string;
  source: string;
  units: Unit[];
}

export interface TopicProgress {
  status: TopicStatus;
  updated: string;
}

// ---------- Library ----------

export type ResourceKind = 'official' | 'book' | 'textbook' | 'video' | 'website' | 'practice' | 'tool';
export type ResourceCost = 'free' | 'paid' | 'freemium';
export type ResourcePriority = 'essential' | 'recommended' | 'supplementary';
export type ResourceStatus = 'none' | 'planned' | 'using' | 'done';

export interface Resource {
  id: string;
  title: string;
  author: string;
  exams: ExamId[];
  kind: ResourceKind;
  cost: ResourceCost;
  priority: ResourcePriority;
  description: string;
  /** The coach's note: how to get the most out of it. */
  howToUse: string;
  url: string;
  custom?: boolean;
}

// ---------- Formulas & flashcards ----------

export interface Formula {
  id: string;
  exam: ExamId;
  group: string;
  name: string;
  tex: string;
  note?: string;
  /** True if it is printed on the official reference/equation sheet (SAT, AP Physics). */
  provided: boolean;
}

export interface Flashcard {
  id: string;
  exam: ExamId;
  deck: string;
  /** Front/back support inline `$…$` and display `$$…$$` math. */
  front: string;
  back: string;
  custom?: boolean;
}

export interface SrsState {
  ease: number;
  interval: number; // days
  reps: number;
  lapses: number;
  due: string; // YYYY-MM-DD
  last?: string;
  /** Date the card was first studied (used for the daily new-card limit). */
  introduced?: string;
}

export type SrsGrade = 'again' | 'hard' | 'good' | 'easy';

// ---------- Practice & mistakes ----------

export type PracticeKind = 'full' | 'section' | 'frq' | 'qbank';

export interface PracticeEntry {
  id: string;
  date: string;
  exam: ExamId;
  kind: PracticeKind;
  source: string;
  /** SAT scaled section scores (200–800). */
  rw?: number;
  math?: number;
  /** AP composite percentage (0–100) from the score estimator or your own grading. */
  percent?: number;
  /** For question-bank / FRQ sets. */
  correct?: number;
  total?: number;
  minutes?: number;
  notes?: string;
}

export type MistakeTag =
  | 'concept'
  | 'careless'
  | 'misread'
  | 'time'
  | 'formula'
  | 'calculator'
  | 'trap'
  | 'guess';

export interface Mistake {
  id: string;
  date: string;
  exam: ExamId;
  topicId?: string;
  source: string;
  tags: MistakeTag[];
  what: string;
  fix: string;
  reviewed: boolean;
}

// ---------- Planner & timer ----------

export interface Task {
  id: string;
  date: string;
  title: string;
  exam?: ExamId;
  minutes?: number;
  done: boolean;
}

export interface StudySession {
  id: string;
  date: string;
  exam?: ExamId;
  minutes: number;
  kind: 'pomodoro' | 'mock' | 'manual';
}

// ---------- Settings ----------

export type ThemePref = 'system' | 'light' | 'dark';

export interface ExamSettings {
  active: boolean;
  date: string | null;
  target: number;
}

export interface Settings {
  name: string;
  theme: ThemePref;
  exams: Record<ExamId, ExamSettings>;
  pomodoro: { focus: number; short: number; long: number; longEvery: number };
  dailyGoalMinutes: number;
  newCardsPerDay: number;
  sound: boolean;
}
