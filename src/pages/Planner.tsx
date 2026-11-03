import { ChevronLeft, ChevronRight, Clock, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { RoadmapTimeline } from '../components/Roadmap';
import { Button, Card, CardHeader, cx, ExamDot, Field, IconButton, PageHeader } from '../components/ui';
import { EXAMS } from '../data/exams';
import { addDays, formatDate, formatMinutes, startOfWeek, todayISO, weekDays } from '../lib/dates';
import { suggestWeek } from '../lib/planner';
import { currentPhase } from '../lib/roadmap';
import type { ExamId, Task } from '../lib/types';
import { useActiveExams, useFocusQueue, useRoadmap } from '../store/selectors';
import { useStore } from '../store/useStore';

function DayColumn({ date, tasks, today, exams }: { date: string; tasks: Task[]; today: string; exams: ExamId[] }) {
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const removeTask = useStore((s) => s.removeTask);
  const [title, setTitle] = useState('');
  const [exam, setExam] = useState<ExamId | ''>('');
  const isToday = date === today;
  const planned = tasks.reduce((s, t) => s + (t.minutes ?? 0), 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ date, title: title.trim(), exam: exam || undefined });
    setTitle('');
  };

  return (
    <Card className={cx('flex min-w-0 flex-col', isToday && 'ring-2 ring-accent/50')}>
      <div className="flex items-baseline justify-between border-b border-line px-4 py-3">
        <p className="font-serif text-[15px] font-semibold">
          {formatDate(date, 'weekday')} <span className="font-sans text-[13px] font-normal text-muted">{formatDate(date, 'short')}</span>
        </p>
        {planned > 0 && <span className="num text-[12px] text-muted">{formatMinutes(planned)}</span>}
      </div>
      <ul className="flex flex-1 flex-col gap-0.5 p-2">
        {tasks.map((t) => (
          <li key={t.id} className="group flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-sunken">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => updateTask(t.id, { done: !t.done })}
              className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
              aria-label={`Done: ${t.title}`}
            />
            <span className="min-w-0 flex-1">
              <span className={cx('block text-[13.5px] leading-snug', t.done && 'text-muted line-through')}>{t.title}</span>
              {(t.exam || t.minutes) && (
                <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted">
                  {t.exam && (
                    <>
                      <ExamDot exam={t.exam} className="size-2" /> {EXAMS[t.exam].short}
                    </>
                  )}
                  {t.minutes ? <span className="num">· {t.minutes} min</span> : null}
                </span>
              )}
            </span>
            <IconButton label="Delete task" onClick={() => removeTask(t.id)} className="size-6 opacity-60 group-hover:opacity-100 sm:opacity-0 sm:focus:opacity-100">
              <Trash2 size={13} />
            </IconButton>
          </li>
        ))}
        {tasks.length === 0 && <li className="px-2 py-1.5 text-[12.5px] text-muted">Free day</li>}
      </ul>
      <form onSubmit={submit} className="flex gap-1.5 border-t border-line p-2">
        <input className="field h-8 min-w-0 flex-1 py-0 text-[13px]" placeholder="Add task…" value={title} onChange={(e) => setTitle(e.target.value)} aria-label={`New task for ${formatDate(date, 'weekday')}`} />
        <select className="field h-8 w-auto px-1.5 py-0 text-[12px]" value={exam} onChange={(e) => setExam(e.target.value as ExamId | '')} aria-label="Exam">
          <option value="">—</option>
          {exams.map((x) => (
            <option key={x} value={x}>
              {EXAMS[x].short}
            </option>
          ))}
        </select>
        <IconButton label="Add task" type="submit" className="size-8 bg-sunken text-ink">
          <Plus size={15} />
        </IconButton>
      </form>
    </Card>
  );
}

function LogTime({ exams }: { exams: ExamId[] }) {
  const addSession = useStore((s) => s.addSession);
  const removeSession = useStore((s) => s.removeSession);
  const sessions = useStore((s) => s.sessions);
  const [date, setDate] = useState(todayISO());
  const [exam, setExam] = useState<ExamId | ''>(exams[0] ?? '');
  const [minutes, setMinutes] = useState('60');
  const recent = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const m = Number(minutes);
    if (!m || m <= 0) return;
    addSession({ date, exam: exam || undefined, minutes: m, kind: 'manual' });
  };

  return (
    <Card>
      <CardHeader title="Log study time" icon={<Clock size={17} />} subtitle="For study done away from the Timer (class, tutoring, homework)." />
      <form onSubmit={submit} className="grid grid-cols-2 gap-3 px-5 sm:grid-cols-[1fr_1fr_7rem_auto] sm:items-end">
        <Field label="Date">{(id) => <input id={id} type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label="Exam">
          {(id) => (
            <select id={id} className="field" value={exam} onChange={(e) => setExam(e.target.value as ExamId | '')}>
              <option value="">General</option>
              {exams.map((x) => (
                <option key={x} value={x}>
                  {EXAMS[x].name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Minutes">{(id) => <input id={id} type="number" min={1} className="field" value={minutes} onChange={(e) => setMinutes(e.target.value)} />}</Field>
        <Button type="submit" variant="primary">
          Log
        </Button>
      </form>
      <ul className="mt-4 border-t border-line">
        {recent.map((s) => (
          <li key={s.id} className="flex items-center gap-3 border-b border-line px-5 py-2 text-[13px] last:border-b-0">
            <span className="num w-24 text-muted">{formatDate(s.date, 'short')}</span>
            <span className="flex flex-1 items-center gap-2">
              {s.exam ? <ExamDot exam={s.exam} /> : <span className="size-2.5 rounded-full bg-muted" aria-hidden />}
              {s.exam ? EXAMS[s.exam].short : 'General'}
              <span className="text-muted">· {s.kind === 'pomodoro' ? 'focus block' : s.kind === 'mock' ? 'mock exam' : 'logged'}</span>
            </span>
            <span className="num font-medium">{formatMinutes(s.minutes)}</span>
            <IconButton label="Delete session" onClick={() => removeSession(s.id)} className="size-7">
              <Trash2 size={13} />
            </IconButton>
          </li>
        ))}
        {recent.length === 0 && <li className="px-5 py-3 text-[13px] text-muted">No study time logged yet.</li>}
      </ul>
    </Card>
  );
}

export default function Planner() {
  const today = todayISO();
  const [monday, setMonday] = useState(() => startOfWeek(today));
  const [notice, setNotice] = useState('');
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const exams = useActiveExams();
  const roadmap = useRoadmap();
  const focus = useFocusQueue(8);
  const days = weekDays(monday);
  const weekTasks = tasks.filter((t) => t.date >= days[0] && t.date <= days[6]);
  const done = weekTasks.filter((t) => t.done).length;
  const phase = currentPhase(roadmap, days.find((d) => d >= today) ?? days[0]);

  const fillWeek = () => {
    const drafts = suggestWeek(days, today, phase, focus, exams);
    const existing = new Set(tasks.map((t) => `${t.date}|${t.title}`));
    const fresh = drafts.filter((d) => !existing.has(`${d.date}|${d.title}`));
    if (!fresh.length) {
      setNotice('This week already has the suggested tasks.');
      return;
    }
    fresh.forEach(addTask);
    setNotice(`Added ${fresh.length} suggested tasks.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Plan"
        title="Planner"
        description="Plan the week in small, specific blocks. “Suggest this week” fills the remaining days from your current roadmap phase and the units that matter most."
        actions={
          <Button variant="primary" onClick={fillWeek}>
            <Sparkles size={16} /> Suggest this week
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <IconButton label="Previous week" onClick={() => setMonday(addDays(monday, -7))}>
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton label="Next week" onClick={() => setMonday(addDays(monday, 7))}>
            <ChevronRight size={18} />
          </IconButton>
          <h2 className="ml-2 font-serif text-[18px] font-semibold">
            {formatDate(days[0], 'short')} – {formatDate(days[6])}
          </h2>
          {monday !== startOfWeek(today) && (
            <Button size="sm" variant="ghost" onClick={() => setMonday(startOfWeek(today))}>
              This week
            </Button>
          )}
        </div>
        <p className="text-[13px] text-muted" role="status">
          {notice && <span className="mr-2 font-medium text-ink-2">{notice}</span>}
          {done}/{weekTasks.length} tasks done
          {phase ? ` · phase: ${phase.title}` : ''}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
        {days.map((d) => (
          <DayColumn key={d} date={d} today={today} exams={exams} tasks={weekTasks.filter((t) => t.date === d)} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your roadmap" subtitle="Generated from your exam dates." />
          <div className="px-5 pb-5">
            <RoadmapTimeline phases={roadmap} today={today} expandAll />
          </div>
        </Card>
        <LogTime exams={exams} />
      </div>
    </>
  );
}
