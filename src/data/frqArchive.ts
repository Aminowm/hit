import type { ExamId } from '../lib/types';

export interface FrqYear {
  year: number;
  questions: number;
}

const range = (from: number, to: number, count: (y: number) => number, skip: number[] = []): FrqYear[] =>
  Array.from({ length: to - from + 1 }, (_, i) => to - i)
    .filter((y) => !skip.includes(y))
    .map((year) => ({ year, questions: count(year) }));

/**
 * Released free-response sets on AP Central (newest first).
 * 2020 is skipped: that year's at-home exam used a different, shortened format.
 * Physics question counts changed with the 2025 redesign (Physics 1: 5 → 4, Physics C: 3 → 4).
 */
export const FRQ_ARCHIVE: Partial<Record<ExamId, FrqYear[]>> = {
  calcbc: range(2010, 2026, () => 6, [2020]),
  physc: range(2010, 2026, (y) => (y >= 2025 ? 4 : 3), [2020]),
  phys1: range(2015, 2026, (y) => (y >= 2025 ? 4 : 5), [2020]),
};

export const frqKey = (exam: ExamId, year: number, q: number) => `${exam}-${year}-${q}`;
