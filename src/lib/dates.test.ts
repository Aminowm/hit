import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, formatClock, startOfWeek, weekDays } from './dates';

describe('dates', () => {
  it('counts days across month and DST boundaries', () => {
    expect(daysBetween('2026-11-03', '2026-12-05')).toBe(32);
    expect(daysBetween('2027-03-13', '2027-03-15')).toBe(2); // US DST change
    expect(daysBetween('2026-12-05', '2026-11-03')).toBe(-32);
  });

  it('adds days and finds Monday', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(startOfWeek('2026-11-03')).toBe('2026-11-02'); // Tue → Mon
    expect(startOfWeek('2026-11-08')).toBe('2026-11-02'); // Sun → Mon
    expect(weekDays('2026-11-02')).toHaveLength(7);
  });

  it('formats clocks', () => {
    expect(formatClock(25 * 60_000)).toBe('25:00');
    expect(formatClock(3_725_000)).toBe('1:02:05');
    expect(formatClock(-5)).toBe('00:00');
  });
});
