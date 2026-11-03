import { parseISODate } from './dates';
import type { FocusItem } from './progress';
import type { Phase } from './roadmap';
import type { ExamId, Task } from './types';

export type TaskDraft = Omit<Task, 'id' | 'done'>;

const unitName = (f: FocusItem) => (f.unit.section ? f.unit.title : `Unit ${f.unit.code}: ${f.unit.title}`);

/**
 * Suggests a week of tasks from the current roadmap phase and the focus queue.
 * Deterministic and conservative: 2–3 blocks per weekday, a heavier weekend.
 */
export function suggestWeek(days: string[], today: string, phase: Phase | undefined, focus: FocusItem[], activeExams: ExamId[]): TaskDraft[] {
  const out: TaskDraft[] = [];
  const byExam = (e: ExamId) => focus.filter((f) => f.exam === e);
  const sat = byExam('sat');
  const ap = focus.filter((f) => f.exam !== 'sat');
  const hasCards = activeExams.length > 0;
  const satActive = activeExams.includes('sat');

  days.forEach((date, i) => {
    if (date < today) return;
    const dow = parseISODate(date).getDay(); // 0 Sun … 6 Sat
    const weekend = dow === 0 || dow === 6;
    const pickAp = ap.length ? ap[i % ap.length] : undefined;
    const pickSat = sat.length ? sat[i % sat.length] : undefined;

    if (hasCards) out.push({ date, title: 'Flashcards — clear today’s reviews', minutes: 15 });

    if (phase?.id === 'sat-sprint' && satActive) {
      if (dow === 6) {
        out.push({ date, exam: 'sat', title: 'Full Bluebook practice test (timed, real start time)', minutes: 140 });
        out.push({ date, exam: 'sat', title: 'Review test: log every miss + lucky guess in the Mistake Log', minutes: 60 });
      } else if (dow === 0) {
        out.push({ date, exam: 'sat', title: 'Re-attempt this week’s Mistake Log entries cold', minutes: 45 });
        if (pickAp) out.push({ date, exam: pickAp.exam, title: `${unitName(pickAp)} — catch up on class material`, minutes: 60 });
      } else {
        if (pickSat) out.push({ date, exam: 'sat', title: `Question Bank (Hard): ${pickSat.unit.title}`, minutes: 40 });
        if (pickAp) out.push({ date, exam: pickAp.exam, title: `${unitName(pickAp)} — homework + 5 extra problems`, minutes: 45 });
      }
      return;
    }

    if (phase?.id === 'mocks') {
      const exam = pickAp?.exam ?? activeExams.find((e) => e !== 'sat');
      if (weekend && exam) out.push({ date, exam, title: `Full timed mock exam (${exam === 'calcbc' ? '3 h 10 min' : '3 h'}) + score it`, minutes: 200 });
      else if (pickAp) out.push({ date, exam: pickAp.exam, title: `Targeted review: ${unitName(pickAp)}`, minutes: 60 });
      return;
    }

    if (phase?.id === 'frq-season') {
      if (pickAp) out.push({ date, exam: pickAp.exam, title: weekend ? 'Timed past FRQ set — grade with official rubric' : `${unitName(pickAp)} — Progress Check questions`, minutes: weekend ? 100 : 50 });
      return;
    }

    // Content build (default)
    if (pickAp) out.push({ date, exam: pickAp.exam, title: weekend ? `${unitName(pickAp)} — mixed practice + one past FRQ` : `${unitName(pickAp)} — study & practice`, minutes: weekend ? 90 : 50 });
    const second = ap.length > 1 ? ap[(i + 1) % ap.length] : undefined;
    if (second && second.exam !== pickAp?.exam) out.push({ date, exam: second.exam, title: `${unitName(second)} — review notes & problems`, minutes: 40 });
  });

  return out;
}
