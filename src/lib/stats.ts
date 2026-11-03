import { addDays } from './dates';
import type { ExamId, StudySession, Task } from './types';

/** Minutes per date (YYYY-MM-DD). */
export function minutesByDate(sessions: StudySession[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of sessions) m.set(s.date, (m.get(s.date) ?? 0) + s.minutes);
  return m;
}

/**
 * Consecutive days (ending today, or yesterday if today has nothing yet)
 * with at least one logged study session or completed task.
 */
export function studyStreak(sessions: StudySession[], tasks: Task[], today: string): number {
  const active = new Set<string>();
  for (const s of sessions) if (s.minutes > 0) active.add(s.date);
  for (const t of tasks) if (t.done) active.add(t.date);

  let day = active.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (active.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export interface DayBreakdown {
  date: string;
  total: number;
  byExam: Partial<Record<ExamId | 'other', number>>;
}

export function dailyBreakdown(sessions: StudySession[], days: string[]): DayBreakdown[] {
  return days.map((date) => {
    const byExam: DayBreakdown['byExam'] = {};
    let total = 0;
    for (const s of sessions) {
      if (s.date !== date) continue;
      const k = s.exam ?? 'other';
      byExam[k] = (byExam[k] ?? 0) + s.minutes;
      total += s.minutes;
    }
    return { date, total, byExam };
  });
}
