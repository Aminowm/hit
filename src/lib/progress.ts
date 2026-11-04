import type { Course, ExamId, TopicProgress, TopicStatus, Unit } from './types';

export const STATUS_ORDER: TopicStatus[] = ['not-started', 'learning', 'practiced', 'mastered'];

export const STATUS_VALUE: Record<TopicStatus, number> = {
  'not-started': 0,
  learning: 1 / 3,
  practiced: 2 / 3,
  mastered: 1,
};

export const STATUS_LABEL: Record<TopicStatus, string> = {
  'not-started': 'Not started',
  learning: 'Learning',
  practiced: 'Practiced',
  mastered: 'Mastered',
};

export function nextStatus(s: TopicStatus): TopicStatus {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(s) + 1) % STATUS_ORDER.length];
}

export type ProgressMap = Record<string, TopicProgress | undefined>;

export const statusOf = (map: ProgressMap, topicId: string): TopicStatus => map[topicId]?.status ?? 'not-started';

/** 0–1 mastery score for a unit (average of topic status values). */
export function unitMastery(unit: Unit, map: ProgressMap): number {
  if (!unit.topics.length) return 0;
  return unit.topics.reduce((s, t) => s + STATUS_VALUE[statusOf(map, t.id)], 0) / unit.topics.length;
}

/** 0–1 mastery for a course, weighted by each unit's exam weight. */
export function courseMastery(course: Course, map: ProgressMap): number {
  let total = 0;
  let weightSum = 0;
  for (const u of course.units) {
    const w = unitWeight(u);
    total += w * unitMastery(u, map);
    weightSum += w;
  }
  return weightSum ? total / weightSum : 0;
}

export function statusCounts(course: Course, map: ProgressMap): Record<TopicStatus, number> {
  const counts: Record<TopicStatus, number> = { 'not-started': 0, learning: 0, practiced: 0, mastered: 0 };
  for (const u of course.units) for (const t of u.topics) counts[statusOf(map, t.id)]++;
  return counts;
}

/** AP units are numbered ("Unit 6"); SAT domains and IELTS skills are named only. */
export const isNumberedUnit = (unit: Unit) => /^\d+$/.test(unit.code);

/** "Unit 6 · Integration…" for AP units, the plain title otherwise. */
export function unitLabel(unit: Unit, sep = ' · '): string {
  return isNumberedUnit(unit) ? `Unit ${unit.code}${sep}${unit.title}` : unit.title;
}

/** Midpoint exam weight as a share of the total score (SAT sections count half). */
export function unitWeight(unit: Unit): number {
  const mid = (unit.weight[0] + unit.weight[1]) / 2 / 100;
  return unit.section ? mid / 2 : mid;
}

export interface FocusItem {
  exam: ExamId;
  unit: Unit;
  mastery: number;
  score: number;
  daysLeft: number | null;
}

/**
 * "What should I study next?" — rank units by exam weight × mastery gap,
 * boosted as the exam approaches. Explainable on purpose: a unit worth 18%
 * that you haven't started beats a 5% unit you have half-learned.
 */
export function focusQueue(
  courses: { course: Course; daysLeft: number | null }[],
  map: ProgressMap,
  limit = 5,
): FocusItem[] {
  const items: FocusItem[] = [];
  for (const { course, daysLeft } of courses) {
    if (daysLeft !== null && daysLeft < 0) continue;
    // Exams without a date yet rank below dated ones until a date is set.
    const urgency = daysLeft === null ? 0.6 : 1 + 30 / Math.max(daysLeft, 7);
    for (const unit of course.units) {
      const mastery = unitMastery(unit, map);
      if (mastery >= 0.999) continue;
      items.push({ exam: course.exam, unit, mastery, daysLeft, score: unitWeight(unit) * (1 - mastery) * urgency });
    }
  }
  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}
