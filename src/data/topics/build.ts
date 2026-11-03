import type { ExamId, Topic, Unit } from '../../lib/types';

/** [code, title, hint?] — code may be '' when the official framework has none. */
export type TopicRow = [code: string, title: string, hint?: string];

/**
 * Builds a unit with stable topic ids (`exam.unit.code`). Ids are persisted in
 * the user's progress, so never renumber an existing topic — append instead.
 */
export function unit(
  exam: ExamId,
  code: string,
  title: string,
  weight: [number, number],
  rows: TopicRow[],
  extra: Partial<Pick<Unit, 'section' | 'badge'>> = {},
): Unit {
  const topics: Topic[] = rows.map(([tCode, tTitle, hint], i) => ({
    id: `${exam}.${code}.${tCode || String(i + 1)}`,
    code: tCode || undefined,
    title: tTitle,
    hint,
  }));
  return { id: `${exam}.${code}`, code, title, weight, topics, ...extra };
}
