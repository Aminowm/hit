import { useMemo } from 'react';
import { BUILTIN_CARDS } from '../data/cards';
import { COURSES } from '../data/topics';
import { EXAM_ORDER } from '../data/exams';
import { daysBetween, todayISO } from '../lib/dates';
import { focusQueue, type FocusItem } from '../lib/progress';
import { buildRoadmap, type Phase } from '../lib/roadmap';
import type { ExamId, Flashcard, SrsState } from '../lib/types';
import { useStore } from './useStore';

/** Exams switched on in Settings, in display order. */
export function useActiveExams(): ExamId[] {
  const exams = useStore((s) => s.settings.exams);
  return useMemo(() => EXAM_ORDER.filter((id) => exams[id].active), [exams]);
}

export function useDaysLeft(exam: ExamId, today = todayISO()): number | null {
  const date = useStore((s) => s.settings.exams[exam].date);
  return date ? daysBetween(today, date) : null;
}

export function useAllCards(): Flashcard[] {
  const custom = useStore((s) => s.customCards);
  return useMemo(() => [...BUILTIN_CARDS, ...custom], [custom]);
}

export interface StudyQueue {
  due: Flashcard[];
  fresh: Flashcard[];
  newToday: number;
}

/**
 * Today's queue: every card that is due, plus new cards up to the daily limit.
 * Pure — exported for tests and reused by the hook below.
 */
export function buildQueue(
  cards: Flashcard[],
  srs: Record<string, SrsState | undefined>,
  exams: ExamId[],
  newPerDay: number,
  today: string,
): StudyQueue {
  const active = new Set(exams);
  const pool = cards.filter((c) => active.has(c.exam));
  const due = pool
    .filter((c) => srs[c.id] && srs[c.id]!.due <= today)
    .sort((a, b) => srs[a.id]!.due.localeCompare(srs[b.id]!.due));
  const newToday = Object.values(srs).filter((s) => s?.introduced === today).length;
  const room = Math.max(0, newPerDay - newToday);
  // Interleave exams so new cards aren't all from one subject.
  const unseen = pool.filter((c) => !srs[c.id]);
  const byExam = exams.map((e) => unseen.filter((c) => c.exam === e));
  const fresh: Flashcard[] = [];
  for (let i = 0; fresh.length < room && byExam.some((list) => i < list.length); i++) {
    for (const list of byExam) if (i < list.length && fresh.length < room) fresh.push(list[i]);
  }
  return { due, fresh, newToday };
}

export function useStudyQueue(exams: ExamId[]): StudyQueue {
  const cards = useAllCards();
  const srs = useStore((s) => s.srs);
  const newPerDay = useStore((s) => s.settings.newCardsPerDay);
  const today = todayISO();
  return useMemo(() => buildQueue(cards, srs, exams, newPerDay, today), [cards, srs, exams, newPerDay, today]);
}

/** Ranked "study next" units across active exams. */
export function useFocusQueue(limit = 5): FocusItem[] {
  const exams = useActiveExams();
  const settings = useStore((s) => s.settings.exams);
  const topics = useStore((s) => s.topics);
  const today = todayISO();
  return useMemo(
    () =>
      focusQueue(
        exams.map((e) => ({ course: COURSES[e], daysLeft: settings[e].date ? daysBetween(today, settings[e].date!) : null })),
        topics,
        limit,
      ),
    [exams, settings, topics, today, limit],
  );
}

/** Periodized plan derived from the active exams' dates. */
export function useRoadmap(): Phase[] {
  const exams = useActiveExams();
  const settings = useStore((s) => s.settings.exams);
  const today = todayISO();
  return useMemo(
    () =>
      buildRoadmap({
        today,
        sat: exams.includes('sat') ? settings.sat.date : null,
        ap: exams.filter((e) => e !== 'sat' && settings[e].date).map((e) => ({ exam: e, date: settings[e].date! })),
      }),
    [exams, settings, today],
  );
}
