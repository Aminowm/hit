import { addDays } from './dates';
import type { SrsGrade, SrsState } from './types';

/**
 * Spaced repetition — a compact SM-2 variant (the algorithm behind classic Anki).
 *  - "again" resets the card to relearn tomorrow and lowers ease.
 *  - "hard" grows the interval slowly, "good" by the ease factor, "easy" faster.
 * Ease is clamped to [1.3, 3.0]; intervals are whole days.
 */

export const NEW_CARD: Omit<SrsState, 'due'> = { ease: 2.5, interval: 0, reps: 0, lapses: 0 };

export function review(prev: SrsState | undefined, grade: SrsGrade, today: string): SrsState {
  const s: SrsState = prev ? { ...prev } : { ...NEW_CARD, due: today, introduced: today };
  let interval: number;

  if (grade === 'again') {
    s.ease = Math.max(1.3, s.ease - 0.2);
    s.lapses += 1;
    s.reps = 0;
    interval = 1;
  } else {
    if (s.reps === 0) {
      interval = grade === 'easy' ? 4 : 1;
    } else if (s.reps === 1) {
      interval = grade === 'easy' ? 7 : grade === 'good' ? 3 : 2;
    } else {
      const base = Math.max(1, s.interval);
      const factor = grade === 'hard' ? 1.2 : grade === 'good' ? s.ease : s.ease * 1.3;
      interval = Math.max(base + 1, Math.round(base * factor));
    }
    if (grade === 'hard') s.ease = Math.max(1.3, s.ease - 0.15);
    if (grade === 'easy') s.ease = Math.min(3.0, s.ease + 0.15);
    s.reps += 1;
  }

  s.interval = interval;
  s.last = today;
  s.due = addDays(today, interval);
  return s;
}

/** Preview label for the grade buttons, e.g. "1d", "3d", "2w". */
export function intervalLabel(days: number): string {
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function isDue(state: SrsState | undefined, today: string): boolean {
  return !!state && state.due <= today;
}
