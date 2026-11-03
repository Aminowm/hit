import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EXAMS } from '../data/exams';
import { todayISO } from '../lib/dates';
import type { ExamId } from '../lib/types';
import { useStore } from './useStore';

export type PomPhase = 'focus' | 'short' | 'long';

interface PomState {
  phase: PomPhase;
  running: boolean;
  /** Epoch ms when the current phase ends (while running). */
  endsAt: number | null;
  /** Remaining ms while paused / idle. */
  remainingMs: number;
  /** Completed focus blocks in the current cycle. */
  cycle: number;
  exam: ExamId | null;
}

interface MockState {
  exam: ExamId | null;
  index: number;
  running: boolean;
  endsAt: number | null;
  remainingMs: number;
  finished: boolean;
}

interface TimerStore {
  pom: PomState;
  mock: MockState;
  pomStart: () => void;
  pomPause: () => void;
  pomReset: (phase?: PomPhase) => void;
  pomSkip: () => void;
  pomSetExam: (exam: ExamId | null) => void;
  mockLoad: (exam: ExamId) => void;
  mockStart: () => void;
  mockPause: () => void;
  mockNext: () => void;
  mockStop: () => void;
  tick: (now: number) => void;
}

const phaseMs = (phase: PomPhase) => {
  const p = useStore.getState().settings.pomodoro;
  return (phase === 'focus' ? p.focus : phase === 'short' ? p.short : p.long) * 60_000;
};

const sectionMs = (exam: ExamId, index: number) => (EXAMS[exam].sections[index]?.minutes ?? 0) * 60_000;

export const PHASE_LABEL: Record<PomPhase, string> = { focus: 'Focus', short: 'Short break', long: 'Long break' };

// ---------------------------------------------------------------- alerts

let audioCtx: AudioContext | null = null;
export function chime(times = 3) {
  if (!useStore.getState().settings.sound) return;
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    for (let i = 0; i < times; i++) {
      const t = ctx.currentTime + i * 0.28;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === times - 1 ? 880 : 660;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  } catch {
    /* audio unavailable — silent */
  }
}

function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body });
  } catch {
    /* ignore */
  }
}

export function requestNotifications() {
  try {
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------- store

export const useTimer = create<TimerStore>()(
  persist(
    (set, get) => ({
      pom: { phase: 'focus', running: false, endsAt: null, remainingMs: 25 * 60_000, cycle: 0, exam: null },
      mock: { exam: null, index: 0, running: false, endsAt: null, remainingMs: 0, finished: false },

      pomStart: () =>
        set(({ pom }) => (pom.running ? {} : { pom: { ...pom, running: true, endsAt: Date.now() + pom.remainingMs } })),
      pomPause: () =>
        set(({ pom }) =>
          pom.running && pom.endsAt
            ? { pom: { ...pom, running: false, endsAt: null, remainingMs: Math.max(0, pom.endsAt - Date.now()) } }
            : {},
        ),
      pomReset: (phase) =>
        set(({ pom }) => {
          const p = phase ?? pom.phase;
          return { pom: { ...pom, phase: p, running: false, endsAt: null, remainingMs: phaseMs(p) } };
        }),
      pomSkip: () => {
        const { pom } = get();
        const next: PomPhase = pom.phase === 'focus' ? 'short' : 'focus';
        set({ pom: { ...pom, phase: next, running: false, endsAt: null, remainingMs: phaseMs(next) } });
      },
      pomSetExam: (exam) => set(({ pom }) => ({ pom: { ...pom, exam } })),

      mockLoad: (exam) =>
        set({ mock: { exam, index: 0, running: false, endsAt: null, remainingMs: sectionMs(exam, 0), finished: false } }),
      mockStart: () =>
        set(({ mock }) =>
          mock.exam && !mock.running && !mock.finished
            ? { mock: { ...mock, running: true, endsAt: Date.now() + mock.remainingMs } }
            : {},
        ),
      mockPause: () =>
        set(({ mock }) =>
          mock.running && mock.endsAt
            ? { mock: { ...mock, running: false, endsAt: null, remainingMs: Math.max(0, mock.endsAt - Date.now()) } }
            : {},
        ),
      mockNext: () => advanceMock(set, get, Date.now(), false),
      mockStop: () => set(({ mock }) => ({ mock: { ...mock, exam: null, running: false, endsAt: null, finished: false } })),

      tick: (now) => {
        const { pom, mock } = get();
        if (pom.running && pom.endsAt && now >= pom.endsAt) {
          const settings = useStore.getState().settings;
          if (pom.phase === 'focus') {
            useStore.getState().addSession({ date: todayISO(), exam: pom.exam ?? undefined, minutes: settings.pomodoro.focus, kind: 'pomodoro' });
            const cycle = pom.cycle + 1;
            const next: PomPhase = cycle % settings.pomodoro.longEvery === 0 ? 'long' : 'short';
            set({ pom: { ...pom, cycle, phase: next, running: false, endsAt: null, remainingMs: phaseMs(next) } });
            chime(3);
            notify('Focus block complete', `Time for a ${PHASE_LABEL[next].toLowerCase()}.`);
          } else {
            set({ pom: { ...pom, phase: 'focus', running: false, endsAt: null, remainingMs: phaseMs('focus') } });
            chime(2);
            notify('Break over', 'Ready for the next focus block?');
          }
        }
        if (mock.running && mock.endsAt && now >= mock.endsAt) advanceMock(set, get, now, true);
      },
    }),
    {
      name: 'lyceum-timer',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pom: s.pom, mock: s.mock }),
    },
  ),
);

type SetFn = (partial: Partial<TimerStore>) => void;

/** Move the mock exam to its next section (auto-continues like the real test). */
function advanceMock(set: SetFn, get: () => TimerStore, now: number, fromTimeout: boolean) {
  const { mock } = get();
  if (!mock.exam) return;
  const sections = EXAMS[mock.exam].sections;
  const nextIndex = mock.index + 1;
  if (fromTimeout) {
    chime(sections[mock.index]?.isBreak ? 2 : 3);
    notify(`${sections[mock.index]?.name ?? 'Section'} — time!`, nextIndex < sections.length ? `Next: ${sections[nextIndex].name}` : 'Mock exam complete.');
  }
  if (nextIndex >= sections.length) {
    const minutes = sections.filter((s) => !s.isBreak).reduce((sum, s) => sum + s.minutes, 0);
    useStore.getState().addSession({ date: todayISO(), exam: mock.exam, minutes, kind: 'mock' });
    set({ mock: { ...mock, running: false, endsAt: null, remainingMs: 0, finished: true } });
    return;
  }
  const ms = sectionMs(mock.exam, nextIndex);
  const keepRunning = mock.running || fromTimeout;
  set({
    mock: {
      ...mock,
      index: nextIndex,
      running: keepRunning,
      endsAt: keepRunning ? now + ms : null,
      remainingMs: ms,
    },
  });
}

/** Re-render every `interval` ms — for live clocks. */
export function useNow(interval = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [interval]);
  return now;
}

export const pomRemaining = (pom: PomState, now: number) => (pom.running && pom.endsAt ? Math.max(0, pom.endsAt - now) : pom.remainingMs);
export const mockRemaining = (mock: MockState, now: number) =>
  mock.running && mock.endsAt ? Math.max(0, mock.endsAt - now) : mock.remainingMs;

/** Mounted once in the app shell: advances timers even while you're on other pages. */
export function useTimerEngine() {
  useEffect(() => {
    const id = window.setInterval(() => useTimer.getState().tick(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);
}
