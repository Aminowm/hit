import { addDays, daysBetween } from './dates';
import type { ExamId } from './types';

export interface Phase {
  id: string;
  title: string;
  start: string;
  end: string;
  focus: string;
  actions: string[];
  exams: ExamId[];
}

interface Input {
  today: string;
  sat: string | null;
  /** AP exam dates that are active and upcoming. */
  ap: { exam: ExamId; date: string }[];
}

/**
 * Builds a periodized plan from the exam calendar:
 *  1. SAT sprint (until the SAT)       2. AP content build
 *  3. FRQ season (~10 → 3 weeks out)   4. Full mocks & review (last 3 weeks)
 * Phases that would be empty or already over are dropped.
 */
export function buildRoadmap({ today, sat, ap }: Input): Phase[] {
  const phases: Phase[] = [];
  const apSorted = [...ap].filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const apExams = apSorted.map((a) => a.exam);
  const firstAp = apSorted[0]?.date ?? null;
  const lastAp = apSorted[apSorted.length - 1]?.date ?? null;
  const satUpcoming = sat && sat >= today ? sat : null;

  if (satUpcoming) {
    const days = daysBetween(today, satUpcoming);
    phases.push({
      id: 'sat-sprint',
      title: 'SAT sprint',
      start: today,
      end: satUpcoming,
      exams: ['sat'],
      focus:
        days <= 45
          ? 'About 70% of study time on SAT, 30% keeping pace in Calc BC and Physics classes.'
          : 'SAT skill-building with weekly full tests, alongside AP coursework.',
      actions: [
        'One full Bluebook test per week (same weekday, same time as the real test).',
        'Review every miss into the Mistake Log the same day.',
        'Daily: 20–30 Hard questions from the Question Bank on your two weakest skills.',
        'Final 3 days: light review only, sleep schedule matched to test morning.',
      ],
    });
  }

  if (firstAp) {
    const contentStart = satUpcoming ? addDays(satUpcoming, 1) : today;
    const frqStart = addDays(firstAp, -70);
    const mockStart = addDays(firstAp, -21);

    if (contentStart < frqStart) {
      phases.push({
        id: 'ap-content',
        title: 'AP content build',
        start: contentStart,
        end: addDays(frqStart, -1),
        exams: apExams,
        focus: 'Finish every unit to at least “Practiced” — prioritize BC Units 6, 9, 10 and Physics C Units 2–3.',
        actions: [
          'One Personal Progress Check in AP Classroom per finished unit.',
          'Flashcards daily (10 minutes) so formulas are automatic by spring.',
          'Weekly: one mixed past FRQ per exam, graded with the official rubric.',
        ],
      });
    }

    const frqFrom = contentStart > frqStart ? contentStart : frqStart;
    if (frqFrom < mockStart) {
      phases.push({
        id: 'frq-season',
        title: 'FRQ season',
        start: frqFrom,
        end: addDays(mockStart, -1),
        exams: apExams,
        focus: 'Timed past FRQ sets and Progress Checks; turn every “Practiced” topic into “Mastered”.',
        actions: [
          'Two timed FRQ sets per week per exam (log them in Practice → FRQ Archive).',
          'Read the chief reader reports for the years you practise.',
          'Re-attempt every Mistake Log entry older than one week.',
        ],
      });
    }

    const mockFrom = contentStart > mockStart ? contentStart : mockStart;
    if (lastAp && mockFrom <= lastAp) {
      phases.push({
        id: 'mocks',
        title: 'Mock exams & final review',
        start: mockFrom,
        end: lastAp,
        exams: apExams,
        focus: 'Full-length timed mocks with the Mock Exam timer, then targeted review of the weakest units.',
        actions: [
          'At least two full mocks per exam, under real timing.',
          'Use the Score Estimator after each mock — aim for a safe margin above the 5 cutoff.',
          'Last 48 hours: formulas, mistake log, sleep. No new material.',
        ],
      });
    }
  }

  return phases.filter((p) => p.start <= p.end);
}

export function currentPhase(phases: Phase[], today: string): Phase | undefined {
  return phases.find((p) => p.start <= today && today <= p.end);
}
