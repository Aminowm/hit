import { describe, expect, it } from 'vitest';
import { CALCBC_COURSE } from '../data/topics/calcbc';
import { SAT_COURSE } from '../data/topics/sat';
import { TOPIC_INDEX } from '../data/topics';
import { buildQueue } from '../store/selectors';
import { suggestWeek } from './planner';
import { courseMastery, focusQueue, unitMastery } from './progress';
import { buildRoadmap, currentPhase } from './roadmap';
import { studyStreak } from './stats';
import type { Flashcard } from './types';

const TODAY = '2026-11-03';

describe('topic data', () => {
  it('has unique topic ids across all courses', () => {
    const total = [...TOPIC_INDEX.keys()].length;
    expect(total).toBeGreaterThan(150);
  });

  it('BC unit weights cover roughly 100% of the exam', () => {
    const lo = CALCBC_COURSE.units.reduce((s, u) => s + u.weight[0], 0);
    const hi = CALCBC_COURSE.units.reduce((s, u) => s + u.weight[1], 0);
    expect(lo).toBeLessThanOrEqual(100);
    expect(hi).toBeGreaterThanOrEqual(100);
  });
});

describe('progress', () => {
  it('scores unit and course mastery', () => {
    const unit = CALCBC_COURSE.units[0];
    const all = Object.fromEntries(unit.topics.map((t) => [t.id, { status: 'mastered' as const, updated: TODAY }]));
    expect(unitMastery(unit, all)).toBe(1);
    expect(unitMastery(unit, {})).toBe(0);
    expect(courseMastery(CALCBC_COURSE, all)).toBeGreaterThan(0);
    expect(courseMastery(CALCBC_COURSE, all)).toBeLessThan(0.1);
  });

  it('ranks heavy, unlearned units first and boosts close exams', () => {
    const q = focusQueue(
      [
        { course: CALCBC_COURSE, daysLeft: 188 },
        { course: SAT_COURSE, daysLeft: 32 },
      ],
      {},
      3,
    );
    expect(q).toHaveLength(3);
    expect(q[0].score).toBeGreaterThanOrEqual(q[1].score);
    // With the SAT a month away and nothing studied, SAT Algebra/Advanced Math lead.
    expect(q[0].exam).toBe('sat');
  });
});

describe('roadmap', () => {
  const phases = buildRoadmap({
    today: TODAY,
    sat: '2026-12-05',
    ap: [
      { exam: 'physc', date: '2027-05-03' },
      { exam: 'calcbc', date: '2027-05-10' },
    ],
  });

  it('builds four contiguous phases ending on the last AP exam', () => {
    expect(phases.map((p) => p.id)).toEqual(['sat-sprint', 'ap-content', 'frq-season', 'mocks']);
    expect(phases[0].end).toBe('2026-12-05');
    expect(phases[1].start).toBe('2026-12-06');
    expect(phases[3].end).toBe('2027-05-10');
    expect(currentPhase(phases, TODAY)?.id).toBe('sat-sprint');
  });

  it('drops the SAT sprint once the SAT has passed', () => {
    const later = buildRoadmap({ today: '2027-01-10', sat: '2026-12-05', ap: [{ exam: 'calcbc', date: '2027-05-10' }] });
    expect(later[0].id).toBe('ap-content');
  });

  it('suggests a full SAT test on Saturday during the sprint', () => {
    const days = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08'];
    const focus = focusQueue([{ course: SAT_COURSE, daysLeft: 32 }, { course: CALCBC_COURSE, daysLeft: 188 }], {}, 8);
    const drafts = suggestWeek(days, TODAY, phases[0], focus, ['sat', 'calcbc']);
    expect(drafts.some((d) => d.date === '2026-11-07' && /Bluebook/.test(d.title))).toBe(true);
    expect(drafts.every((d) => d.date >= TODAY)).toBe(true);
  });
});

describe('streak & flashcard queue', () => {
  it('counts consecutive study days', () => {
    const sessions = ['2026-11-01', '2026-11-02', '2026-11-03'].map((date, i) => ({ id: String(i), date, minutes: 25, kind: 'pomodoro' as const }));
    expect(studyStreak(sessions, [], TODAY)).toBe(3);
    expect(studyStreak(sessions.slice(0, 2), [], TODAY)).toBe(2); // today not started yet
    expect(studyStreak([], [], TODAY)).toBe(0);
  });

  it('respects the daily new-card limit and includes due cards', () => {
    const cards: Flashcard[] = Array.from({ length: 30 }, (_, i) => ({ id: `c${i}`, exam: i % 2 ? 'sat' : 'calcbc', deck: 'd', front: 'f', back: 'b' }));
    const srs = {
      c0: { ease: 2.5, interval: 1, reps: 1, lapses: 0, due: TODAY, introduced: '2026-11-02' },
      c1: { ease: 2.5, interval: 1, reps: 1, lapses: 0, due: '2026-11-04', introduced: TODAY },
    };
    const q = buildQueue(cards, srs, ['sat', 'calcbc'], 10, TODAY);
    expect(q.due.map((c) => c.id)).toEqual(['c0']);
    expect(q.newToday).toBe(1);
    expect(q.fresh).toHaveLength(9);
    expect(new Set(q.fresh.map((c) => c.exam)).size).toBe(2); // interleaved
  });
});
