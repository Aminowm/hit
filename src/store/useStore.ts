import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EXAMS } from '../data/exams';
import { todayISO } from '../lib/dates';
import { safeStorage } from '../lib/env';
import { review } from '../lib/srs';
import type {
  ExamId,
  ExamSettings,
  Flashcard,
  Mistake,
  PracticeEntry,
  Resource,
  ResourceStatus,
  Settings,
  SrsGrade,
  SrsState,
  StudySession,
  Task,
  TopicProgress,
  TopicStatus,
} from '../lib/types';

export const STORAGE_KEY = 'lyceum-v1';

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const examDefaults = (id: ExamId, active: boolean): ExamSettings => ({
  active,
  date: EXAMS[id].defaultDate,
  target: EXAMS[id].defaultTarget,
});

export const DEFAULT_SETTINGS: Settings = {
  name: '',
  theme: 'system',
  exams: {
    sat: examDefaults('sat', true),
    calcbc: examDefaults('calcbc', true),
    physc: examDefaults('physc', true),
    phys1: examDefaults('phys1', true),
  },
  pomodoro: { focus: 25, short: 5, long: 15, longEvery: 4 },
  dailyGoalMinutes: 120,
  newCardsPerDay: 15,
  sound: true,
};

/** Everything that is persisted and exported. */
export interface StudyData {
  settings: Settings;
  topics: Record<string, TopicProgress>;
  resourceStatus: Record<string, ResourceStatus>;
  customResources: Resource[];
  mistakes: Mistake[];
  practice: PracticeEntry[];
  frqDone: Record<string, boolean>;
  tasks: Task[];
  sessions: StudySession[];
  customCards: Flashcard[];
  srs: Record<string, SrsState>;
}

export const EMPTY_DATA: StudyData = {
  settings: DEFAULT_SETTINGS,
  topics: {},
  resourceStatus: {},
  customResources: [],
  mistakes: [],
  practice: [],
  frqDone: {},
  tasks: [],
  sessions: [],
  customCards: [],
  srs: {},
};

interface Actions {
  updateSettings: (patch: Partial<Settings>) => void;
  updateExam: (id: ExamId, patch: Partial<ExamSettings>) => void;

  setTopicStatus: (topicId: string, status: TopicStatus) => void;
  setManyTopics: (topicIds: string[], status: TopicStatus) => void;

  setResourceStatus: (id: string, status: ResourceStatus) => void;
  addResource: (r: Omit<Resource, 'id' | 'custom'>) => void;
  removeResource: (id: string) => void;

  addMistake: (m: Omit<Mistake, 'id'>) => void;
  updateMistake: (id: string, patch: Partial<Mistake>) => void;
  removeMistake: (id: string) => void;

  addPractice: (p: Omit<PracticeEntry, 'id'>) => void;
  removePractice: (id: string) => void;
  toggleFrq: (key: string) => void;

  addTask: (t: Omit<Task, 'id' | 'done'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;

  addSession: (s: Omit<StudySession, 'id'>) => void;
  removeSession: (id: string) => void;

  addCard: (c: Omit<Flashcard, 'id' | 'custom'>) => void;
  removeCard: (id: string) => void;
  gradeCard: (id: string, grade: SrsGrade) => void;

  importData: (data: unknown) => void;
  resetAll: () => void;
}

export type StoreState = StudyData & Actions;

/** Merge persisted/imported data over defaults so new fields never come back undefined. */
export function normalizeData(input: unknown): StudyData {
  const d = (input && typeof input === 'object' ? input : {}) as Partial<StudyData>;
  const s = (d.settings ?? {}) as Partial<Settings>;
  const exams = { ...DEFAULT_SETTINGS.exams };
  for (const id of Object.keys(exams) as ExamId[]) {
    exams[id] = { ...exams[id], ...(s.exams?.[id] ?? {}) };
  }
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const obj = <T,>(v: unknown): T => (v && typeof v === 'object' && !Array.isArray(v) ? (v as T) : ({} as T));
  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...s,
      exams,
      pomodoro: { ...DEFAULT_SETTINGS.pomodoro, ...(s.pomodoro ?? {}) },
    },
    topics: obj(d.topics),
    resourceStatus: obj(d.resourceStatus),
    customResources: arr(d.customResources),
    mistakes: arr(d.mistakes),
    practice: arr(d.practice),
    frqDone: obj(d.frqDone),
    tasks: arr(d.tasks),
    sessions: arr(d.sessions),
    customCards: arr(d.customCards),
    srs: obj(d.srs),
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...EMPTY_DATA,

      updateSettings: (patch) => set((st) => ({ settings: { ...st.settings, ...patch } })),
      updateExam: (id, patch) =>
        set((st) => ({
          settings: { ...st.settings, exams: { ...st.settings.exams, [id]: { ...st.settings.exams[id], ...patch } } },
        })),

      setTopicStatus: (topicId, status) =>
        set((st) => ({ topics: { ...st.topics, [topicId]: { status, updated: todayISO() } } })),
      setManyTopics: (topicIds, status) =>
        set((st) => {
          const topics = { ...st.topics };
          const updated = todayISO();
          for (const id of topicIds) topics[id] = { status, updated };
          return { topics };
        }),

      setResourceStatus: (id, status) => set((st) => ({ resourceStatus: { ...st.resourceStatus, [id]: status } })),
      addResource: (r) => set((st) => ({ customResources: [...st.customResources, { ...r, id: `custom-${uid()}`, custom: true }] })),
      removeResource: (id) =>
        set((st) => {
          const { [id]: _removed, ...resourceStatus } = st.resourceStatus;
          return { customResources: st.customResources.filter((r) => r.id !== id), resourceStatus };
        }),

      addMistake: (m) => set((st) => ({ mistakes: [{ ...m, id: uid() }, ...st.mistakes] })),
      updateMistake: (id, patch) => set((st) => ({ mistakes: st.mistakes.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeMistake: (id) => set((st) => ({ mistakes: st.mistakes.filter((m) => m.id !== id) })),

      addPractice: (p) => set((st) => ({ practice: [...st.practice, { ...p, id: uid() }] })),
      removePractice: (id) => set((st) => ({ practice: st.practice.filter((p) => p.id !== id) })),
      toggleFrq: (key) =>
        set((st) => {
          const frqDone = { ...st.frqDone };
          if (frqDone[key]) delete frqDone[key];
          else frqDone[key] = true;
          return { frqDone };
        }),

      addTask: (t) => set((st) => ({ tasks: [...st.tasks, { ...t, id: uid(), done: false }] })),
      updateTask: (id, patch) => set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) => set((st) => ({ tasks: st.tasks.filter((t) => t.id !== id) })),

      addSession: (s) => set((st) => ({ sessions: [...st.sessions, { ...s, id: uid() }] })),
      removeSession: (id) => set((st) => ({ sessions: st.sessions.filter((s) => s.id !== id) })),

      addCard: (c) => set((st) => ({ customCards: [...st.customCards, { ...c, id: `custom:${uid()}`, custom: true }] })),
      removeCard: (id) =>
        set((st) => {
          const { [id]: _removed, ...srs } = st.srs;
          return { customCards: st.customCards.filter((c) => c.id !== id), srs };
        }),
      gradeCard: (id, grade) => set((st) => ({ srs: { ...st.srs, [id]: review(st.srs[id], grade, todayISO()) } })),

      importData: (data) => set(() => normalizeData(data)),
      resetAll: () => set(() => ({ ...EMPTY_DATA })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (st): StudyData => ({
        settings: st.settings,
        topics: st.topics,
        resourceStatus: st.resourceStatus,
        customResources: st.customResources,
        mistakes: st.mistakes,
        practice: st.practice,
        frqDone: st.frqDone,
        tasks: st.tasks,
        sessions: st.sessions,
        customCards: st.customCards,
        srs: st.srs,
      }),
      merge: (persisted, current) => ({ ...current, ...normalizeData(persisted) }),
    },
  ),
);

/** Snapshot of just the data (for export). */
export function exportData(): StudyData {
  const st = useStore.getState();
  return normalizeData(st);
}
