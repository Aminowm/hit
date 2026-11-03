import { describe, expect, it } from 'vitest';
import { intervalLabel, isDue, review } from './srs';

const T = '2026-11-03';

describe('spaced repetition', () => {
  it('schedules a new card for tomorrow on "good" and records the intro date', () => {
    const s = review(undefined, 'good', T);
    expect(s.interval).toBe(1);
    expect(s.due).toBe('2026-11-04');
    expect(s.introduced).toBe(T);
    expect(s.reps).toBe(1);
  });

  it('grows intervals with successive good reviews', () => {
    let s = review(undefined, 'good', T);
    s = review(s, 'good', s.due);
    expect(s.interval).toBe(3);
    const before = s.interval;
    s = review(s, 'good', s.due);
    expect(s.interval).toBeGreaterThan(before);
  });

  it('resets on "again" and lowers ease, never below 1.3', () => {
    let s = review(undefined, 'easy', T);
    for (let i = 0; i < 20; i++) s = review(s, 'again', T);
    expect(s.interval).toBe(1);
    expect(s.reps).toBe(0);
    expect(s.ease).toBeCloseTo(1.3);
    expect(s.lapses).toBe(20);
    expect(s.introduced).toBe(T);
  });

  it('orders grades: again < hard <= good < easy', () => {
    let s = review(undefined, 'good', T);
    s = review(s, 'good', s.due);
    const day = s.due;
    const [a, h, g, e] = (['again', 'hard', 'good', 'easy'] as const).map((x) => review(s, x, day).interval);
    expect(a).toBeLessThan(h);
    expect(h).toBeLessThanOrEqual(g);
    expect(g).toBeLessThan(e);
  });

  it('labels intervals and detects due cards', () => {
    expect(intervalLabel(3)).toBe('3d');
    expect(intervalLabel(14)).toBe('2w');
    expect(isDue(review(undefined, 'good', T), '2026-11-04')).toBe(true);
    expect(isDue(review(undefined, 'good', T), T)).toBe(false);
    expect(isDue(undefined, T)).toBe(false);
  });
});
