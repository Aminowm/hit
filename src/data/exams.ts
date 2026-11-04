import type { ExamDef, ExamId } from '../lib/types';

/**
 * Exam definitions. Dates and formats reflect the 2026–27 cycle:
 *  - SAT Dec 5, 2026 (registration Nov 20, late Nov 24) — College Board SAT dates page.
 *  - AP Physics C: Mechanics Mon May 3, 2027 (AM); AP Calculus BC Mon May 10, 2027 (AM).
 *  - AP Calculus multiple-choice section shortened from May 2027: 42 questions in 100 minutes.
 * Every date is editable in Settings — always double-check with College Board / your AP coordinator.
 */
export const EXAMS: Record<ExamId, ExamDef> = {
  sat: {
    id: 'sat',
    name: 'Digital SAT',
    short: 'SAT',
    scale: '400–1600',
    defaultDate: '2026-12-05',
    defaultTarget: 1550,
    target: { min: 400, max: 1600, step: 10 },
    dateConfirmed: true,
    officialUrl: 'https://satsuite.collegeboard.org/sat/dates-deadlines',
    sections: [
      { name: 'Reading & Writing · Module 1', minutes: 32, questions: 27 },
      { name: 'Reading & Writing · Module 2', minutes: 32, questions: 27, note: 'Adaptive: harder or easier based on Module 1' },
      { name: 'Break', minutes: 10, isBreak: true },
      { name: 'Math · Module 1', minutes: 35, questions: 22, note: 'Desmos calculator allowed' },
      { name: 'Math · Module 2', minutes: 35, questions: 22, note: 'Adaptive · Desmos calculator allowed' },
    ],
    facts: [
      'Two sections (Reading & Writing, Math), each 200–800; total 400–1600.',
      'Section-adaptive: your Module 1 performance routes you to a harder or easier Module 2. A 1550 requires the harder route in both sections.',
      'The Desmos graphing calculator is built into Bluebook for the whole Math section — and a reference sheet is provided.',
      'About 2 h 14 min of testing (98 questions), taken in the Bluebook app.',
    ],
    deadlines: [
      { label: 'SAT registration deadline', date: '2026-11-20' },
      { label: 'SAT late registration / changes', date: '2026-11-24' },
    ],
  },
  calcbc: {
    id: 'calcbc',
    name: 'AP Calculus BC',
    short: 'Calc BC',
    scale: '1–5',
    defaultDate: '2027-05-10',
    defaultTarget: 5,
    target: { min: 1, max: 5, step: 1 },
    dateConfirmed: true,
    officialUrl: 'https://apcentral.collegeboard.org/courses/ap-calculus-bc/exam',
    sections: [
      { name: 'Section I · Part A (MCQ)', minutes: 62, questions: 29, note: 'No calculator' },
      { name: 'Section I · Part B (MCQ)', minutes: 38, questions: 13, note: 'Graphing calculator required' },
      { name: 'Break', minutes: 10, isBreak: true },
      { name: 'Section II · Part A (FRQ)', minutes: 30, questions: 2, note: 'Graphing calculator required' },
      { name: 'Section II · Part B (FRQ)', minutes: 60, questions: 4, note: 'No calculator' },
    ],
    facts: [
      'New for May 2027: 42 multiple-choice questions in 100 minutes (was 45 in 105). Free response unchanged: 6 questions in 90 minutes.',
      'Multiple choice and free response are each worth 50% of the score.',
      'There is NO formula sheet — every derivative, integral and series must be memorized.',
      'You also receive an AB subscore based on the AB-level content.',
    ],
    deadlines: [{ label: 'AP exam registration (avoid late fee — confirm with your school)', date: '2026-11-13' }],
  },
  phys1: {
    id: 'phys1',
    name: 'AP Physics 1',
    short: 'Physics 1',
    scale: '1–5',
    defaultDate: null,
    defaultTarget: 5,
    target: { min: 1, max: 5, step: 1 },
    dateConfirmed: false,
    officialUrl: 'https://apcentral.collegeboard.org/courses/ap-physics-1/exam',
    sections: [
      { name: 'Section I (MCQ)', minutes: 80, questions: 40, note: 'Calculator + equation sheet allowed' },
      { name: 'Break', minutes: 10, isBreak: true },
      {
        name: 'Section II (FRQ)',
        minutes: 100,
        questions: 4,
        note: 'Math Routines · Translation Between Representations · Experimental Design · Qual/Quant Translation',
      },
    ],
    facts: [
      'Algebra-based. 8 units since the 2024–25 redesign — Fluids (Unit 8) is back in the course.',
      '40 multiple-choice questions (80 min) + 4 free-response questions (100 min); each section is 50%.',
      'An equation sheet and a calculator are allowed for the entire exam.',
      'The perfect conceptual foundation for Physics C: Mechanics — same 7 core units, minus the calculus.',
    ],
    deadlines: [],
  },
  physc: {
    id: 'physc',
    name: 'AP Physics C: Mechanics',
    short: 'Physics C',
    scale: '1–5',
    defaultDate: '2027-05-03',
    defaultTarget: 5,
    target: { min: 1, max: 5, step: 1 },
    dateConfirmed: true,
    officialUrl: 'https://apcentral.collegeboard.org/courses/ap-physics-c-mechanics/exam',
    sections: [
      { name: 'Section I (MCQ)', minutes: 80, questions: 40, note: 'Calculator + equation sheet allowed' },
      { name: 'Break', minutes: 10, isBreak: true },
      {
        name: 'Section II (FRQ)',
        minutes: 100,
        questions: 4,
        note: 'Math Routines · Translation Between Representations · Experimental Design · Qual/Quant Translation',
      },
    ],
    facts: [
      'Calculus-based mechanics: derivatives and integrals appear in setups (variable forces, rotational inertia, drag).',
      '40 multiple-choice questions (80 min) + 4 free-response questions (100 min); each section is 50%.',
      'Historically one of the most generous curves among AP exams — partial credit on FRQs adds up fast.',
      'Calc BC Units 6–8 (integration, differential equations) directly power Units 2, 3, 5 and 7 here.',
    ],
    deadlines: [{ label: 'AP exam registration (avoid late fee — confirm with your school)', date: '2026-11-13' }],
  },
  ielts: {
    id: 'ielts',
    name: 'IELTS Academic',
    short: 'IELTS',
    scale: '0–9',
    defaultDate: null,
    defaultTarget: 7.5,
    target: { min: 4, max: 9, step: 0.5 },
    dateConfirmed: false,
    officialUrl: 'https://ielts.org/',
    sections: [
      { name: 'Listening', minutes: 30, questions: 40, note: 'Four recordings, each heard once' },
      { name: 'Reading', minutes: 60, questions: 40, note: 'Three long passages · no extra time to transfer answers' },
      { name: 'Writing · Task 1', minutes: 20, questions: 1, note: 'Suggested 20 min · describe a visual · 150+ words' },
      { name: 'Writing · Task 2', minutes: 40, questions: 1, note: 'Suggested 40 min · essay · 250+ words' },
      { name: 'Break', minutes: 10, isBreak: true },
      { name: 'Speaking', minutes: 14, questions: 3, note: 'Part 1: 4–5 min · Part 2: 1 min prep + up to 2 min talk · Part 3: 4–5 min' },
    ],
    facts: [
      'Four skills, each scored 0–9 in half bands. The overall band is their average: .25 rounds up to the next half band and .75 up to the next whole band.',
      'Listening, Reading and Writing are taken together; Speaking is a face-to-face interview, sometimes on a different day.',
      'On computer, Listening ends with 2 minutes to check answers; on paper you get 10 minutes to transfer them.',
      'Writing Task 2 is worth twice as much as Task 1. Universities usually ask for 6.5–7.5 overall with a minimum in each skill.',
    ],
    deadlines: [],
  },
};

export const EXAM_ORDER: ExamId[] = ['sat', 'calcbc', 'physc', 'phys1', 'ielts'];

/**
 * Series order for stacked charts. Neighbouring colours in this order were
 * validated for colour-vision deficiency; SAT violet must never sit next to Calc BC blue.
 */
export const CHART_ORDER: ExamId[] = ['calcbc', 'physc', 'phys1', 'sat', 'ielts'];

export const examColorVar = (id: ExamId) => `var(--exam-${id})`;
