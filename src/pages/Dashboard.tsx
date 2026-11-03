import { ArrowRight, CalendarClock, Flame, Layers, ListChecks, Plus, Target, Timer } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, StackedColumns } from '../components/charts';
import { RoadmapTimeline } from '../components/Roadmap';
import { Badge, Button, buttonClass, Card, CardHeader, cx, ExamDot, ExamTag, Meter, Stat } from '../components/ui';
import { EXAMS } from '../data/exams';
import { COURSES } from '../data/topics';
import { addDays, daysBetween, formatCountdown, formatDate, formatMinutes, startOfWeek, todayISO, weekDays } from '../lib/dates';
import { courseMastery, statusCounts } from '../lib/progress';
import { currentPhase } from '../lib/roadmap';
import { dailyBreakdown, minutesByDate, studyStreak } from '../lib/stats';
import type { ExamId } from '../lib/types';
import { useActiveExams, useFocusQueue, useRoadmap, useStudyQueue } from '../store/selectors';
import { useStore } from '../store/useStore';

function Welcome() {
  const update = useStore((s) => s.updateSettings);
  return (
    <Card className="flex flex-col gap-4 border-accent/30 bg-accent-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="font-serif text-[18px] font-semibold">Welcome to Lyceum</h2>
        <p className="mt-1 max-w-2xl text-[14px] text-ink-2">
          A free study desk for the Digital SAT, AP Calculus BC and AP Physics. It’s set up for the December SAT and the May AP exams with a
          1550 / 5 target; change your exams, dates and goals in Settings. Your progress stays private in this browser, with nothing to sign up for.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link to="/settings" className={buttonClass('primary')} onClick={() => update({ welcomed: true })}>
          Set my exams
        </Link>
        <Button variant="ghost" onClick={() => update({ welcomed: true })}>
          Dismiss
        </Button>
      </div>
    </Card>
  );
}

function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 5 ? 'Burning the midnight oil' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function CountdownCard({ exam, today }: { exam: ExamId; today: string }) {
  const cfg = useStore((s) => s.settings.exams[exam]);
  const topics = useStore((s) => s.topics);
  const def = EXAMS[exam];
  const course = COURSES[exam];
  const mastery = courseMastery(course, topics);
  const counts = statusCounts(course, topics);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const days = cfg.date ? daysBetween(today, cfg.date) : null;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-[14px] font-semibold">
          <ExamDot exam={exam} />
          <span className="line-clamp-2">{def.name}</span>
        </span>
        <Badge tone="neutral">Target {cfg.target}</Badge>
      </div>
      {days !== null && cfg.date ? (
        <div>
          <p className="font-serif text-[40px] leading-none font-semibold tracking-tight">
            {days > 1 ? days : formatCountdown(days)}
            {days > 1 && <span className="ml-1.5 font-sans text-[15px] font-medium text-muted">days</span>}
          </p>
          <p className="mt-1.5 text-[13px] text-muted">
            {formatDate(cfg.date, 'long')}
            {!def.dateConfirmed && ' · unconfirmed'}
          </p>
        </div>
      ) : (
        <div>
          <p className="font-serif text-[22px] leading-tight font-semibold text-ink-2">No date yet</p>
          <Link to="/settings" className="mt-1 inline-block text-[13px] font-medium text-accent hover:underline">
            Set exam date →
          </Link>
        </div>
      )}
      <div className="mt-auto">
        <div className="mb-1.5 flex items-baseline justify-between text-[12.5px]">
          <span className="text-muted">Weighted mastery</span>
          <span className="num font-semibold">{Math.round(mastery * 100)}%</span>
        </div>
        <Meter value={mastery} color={`var(--exam-${exam})`} label={`${def.name} mastery`} />
        <p className="mt-1.5 text-[12px] text-muted">
          {counts.mastered}/{total} topics mastered · {counts.practiced} practiced
        </p>
      </div>
    </Card>
  );
}

function TodayTasks({ today }: { today: string }) {
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const exams = useActiveExams();
  const [title, setTitle] = useState('');
  const [exam, setExam] = useState<ExamId | ''>('');
  const todays = tasks.filter((t) => t.date === today);
  const overdue = tasks.filter((t) => t.date < today && !t.done);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ date: today, title: title.trim(), exam: exam || undefined });
    setTitle('');
  };

  return (
    <Card>
      <CardHeader
        title="Today"
        icon={<ListChecks size={17} />}
        subtitle={todays.length ? `${todays.filter((t) => t.done).length} of ${todays.length} done` : 'Plan the day in one line'}
        action={
          <Link to="/planner" className="text-[13px] font-medium text-accent hover:underline">
            Planner
          </Link>
        }
      />
      <ul className="flex flex-col px-3">
        {[...overdue, ...todays].map((t) => (
          <li key={t.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-sunken">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => updateTask(t.id, { done: !t.done })}
                className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
              />
              <span className={cx('min-w-0 flex-1 text-[14px]', t.done && 'text-muted line-through')}>{t.title}</span>
              {t.date < today && <Badge tone="warn">Overdue</Badge>}
              {t.exam && <ExamDot exam={t.exam} className="mt-1.5" />}
            </label>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-2 px-5 pt-2 pb-5">
        <input className="field min-w-0 flex-1" placeholder="Add a task for today…" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="New task" />
        <select className="field w-auto" value={exam} onChange={(e) => setExam(e.target.value as ExamId | '')} aria-label="Exam">
          <option value="">—</option>
          {exams.map((x) => (
            <option key={x} value={x}>
              {EXAMS[x].short}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" aria-label="Add task">
          <Plus size={16} />
        </Button>
      </form>
    </Card>
  );
}

export default function Dashboard() {
  const today = todayISO();
  const settings = useStore((s) => s.settings);
  const sessions = useStore((s) => s.sessions);
  const tasks = useStore((s) => s.tasks);
  const practice = useStore((s) => s.practice);
  const mistakes = useStore((s) => s.mistakes);
  const exams = useActiveExams();
  const queue = useStudyQueue(exams);

  const focus = useFocusQueue(5);
  const roadmap = useRoadmap();
  const phase = currentPhase(roadmap, today);

  const minutesToday = minutesByDate(sessions).get(today) ?? 0;
  const streak = studyStreak(sessions, tasks, today);
  const week = weekDays(startOfWeek(today));
  const breakdown = dailyBreakdown(sessions, week);
  const weekTotal = breakdown.reduce((s, d) => s + d.total, 0);

  const deadlines = exams
    .flatMap((e) => EXAMS[e].deadlines.map((d) => ({ ...d, exam: e })))
    .filter((d) => d.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((d, i, arr) => arr.findIndex((x) => x.label === d.label && x.date === d.date) === i);

  const satScores = practice
    .filter((p) => p.exam === 'sat' && p.rw && p.math)
    .map((p) => ({ date: p.date, value: (p.rw ?? 0) + (p.math ?? 0) }));
  const unreviewed = mistakes.filter((m) => !m.reviewed).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-1.5">{formatDate(today, 'long')}</p>
          <h1 className="font-serif text-[30px] leading-tight font-semibold sm:text-[36px]">
            {greeting()}
            {settings.name ? `, ${settings.name}` : ''}.
          </h1>
          {phase && (
            <p className="mt-2 max-w-2xl text-[15px] text-ink-2">
              <span className="font-semibold text-ink">{phase.title}</span> · {phase.focus}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to="/timer" className={buttonClass('primary')}>
            <Timer size={16} /> Start focus block
          </Link>
        </div>
      </header>

      {!settings.welcomed && <Welcome />}

      {/* Countdowns */}
      <div className={cx('grid gap-4 sm:grid-cols-2', exams.length >= 3 ? 'xl:grid-cols-4' : 'xl:grid-cols-2')}>
        {exams.map((e) => (
          <CountdownCard key={e} exam={e} today={today} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Focus queue */}
          <Card>
            <CardHeader
              title="Study next"
              icon={<Target size={17} />}
              subtitle="Units ranked by exam weight × how much is left to learn, boosted as each exam gets closer."
            />
            <ol className="flex flex-col px-3 pb-3">
              {focus.length === 0 && <li className="px-2 pb-3 text-sm text-muted">Everything is mastered. Time for full mocks!</li>}
              {focus.map((f, i) => (
                <li key={f.unit.id}>
                  <Link to={`/topics/${f.exam}#${f.unit.id}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-sunken">
                    <span className="num font-serif text-[17px] font-semibold text-muted">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[14px] font-medium">
                        <span className="truncate">
                          {f.unit.section ? '' : `Unit ${f.unit.code} · `}
                          {f.unit.title}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <Meter value={f.mastery} color={`var(--exam-${f.exam})`} className="h-1.5 max-w-40" label="Unit mastery" />
                        <span className="num text-[12px] text-muted">{Math.round(f.mastery * 100)}%</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <ExamTag exam={f.exam} />
                      <span className="hidden text-[12px] text-muted sm:inline">
                        {f.unit.weight[0] === f.unit.weight[1] ? `${f.unit.weight[0]}%` : `${f.unit.weight[0]}–${f.unit.weight[1]}%`}
                        {f.unit.section ? ` of ${f.unit.section === 'Math' ? 'Math' : 'R&W'}` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>

          {/* Week chart */}
          <Card>
            <CardHeader
              title="This week"
              icon={<CalendarClock size={17} />}
              subtitle={`${formatMinutes(weekTotal)} studied · daily goal ${formatMinutes(settings.dailyGoalMinutes)}`}
            />
            <div className="px-5 pb-5">
              <StackedColumns
                ariaLabel="Minutes studied per day this week, by exam"
                data={breakdown.map((d) => ({ label: formatDate(d.date, 'weekday'), sublabel: d.total ? String(d.total) : '', values: d.byExam }))}
                keys={[
                  ...exams.map((e) => ({ id: e, label: EXAMS[e].short, color: `var(--exam-${e})` })),
                  { id: 'other', label: 'General', color: 'var(--muted)' },
                ]}
                goal={{ value: settings.dailyGoalMinutes, label: 'Goal' }}
                format={(v) => `${Math.round(v)}`}
              />
              <p className="mt-2 text-[12px] text-muted">Minutes per day. Focus blocks and mock exams from the Timer are logged automatically.</p>
            </div>
          </Card>

          {/* Roadmap */}
          <Card>
            <CardHeader title="Roadmap" subtitle="Built from your exam dates — it updates when you change them in Settings." />
            <div className="px-5 pb-5">
              <RoadmapTimeline phases={roadmap} today={today} />
            </div>
          </Card>
        </div>

        {/* On phones the "Today" column comes first: it's what you act on. */}
        <div className="order-first flex min-w-0 flex-col gap-6 lg:order-none">
          <TodayTasks today={today} />

          <Card className="grid grid-cols-2 gap-5 p-5">
            <Stat
              label="Study streak"
              value={
                <span className="flex items-center gap-1.5">
                  {streak}
                  <Flame size={20} className={streak ? 'text-accent' : 'text-muted'} />
                </span>
              }
              hint={streak === 1 ? 'day' : 'days'}
            />
            <Stat label="Today" value={formatMinutes(minutesToday)} hint={`${Math.min(100, Math.round((minutesToday / settings.dailyGoalMinutes) * 100))}% of goal`} />
            <Stat
              label="Flashcards"
              value={queue.due.length + queue.fresh.length}
              hint={
                <Link to="/flashcards" className="inline-flex items-center gap-1 text-accent hover:underline">
                  <Layers size={13} /> Review now
                </Link>
              }
            />
            <Stat
              label="Mistakes to review"
              value={unreviewed}
              hint={
                <Link to="/mistakes" className="text-accent hover:underline">
                  Open log →
                </Link>
              }
            />
          </Card>

          {deadlines.length > 0 && (
            <Card>
              <CardHeader title="Deadlines" subtitle="Registration dates — confirm on College Board." />
              <ul className="flex flex-col gap-1 px-5 pb-5">
                {deadlines.map((d) => {
                  const n = daysBetween(today, d.date);
                  return (
                    <li key={d.label + d.date} className="flex items-start justify-between gap-3 border-t border-line py-2.5 first:border-t-0 first:pt-0">
                      <span className="min-w-0 text-[13.5px]">
                        <span className="flex items-center gap-2 font-medium">
                          <ExamDot exam={d.exam} /> {formatDate(d.date)}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] text-muted">{d.label}</span>
                      </span>
                      <Badge tone={n <= 7 ? 'bad' : n <= 21 ? 'warn' : 'neutral'}>{formatCountdown(n)}</Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {exams.includes('sat') && (
            <Card>
              <CardHeader
                title="SAT practice scores"
                subtitle={satScores.length ? `Best ${Math.max(...satScores.map((s) => s.value))} · target ${settings.exams.sat.target}` : undefined}
              />
              <div className="px-5 pb-5">
                {satScores.length ? (
                  <LineChart
                    ariaLabel="SAT practice test totals over time"
                    series={[{ id: 'sat', label: 'Total', color: 'var(--exam-sat)', points: satScores }]}
                    domain={[Math.max(400, Math.min(...satScores.map((s) => s.value), settings.exams.sat.target) - 60), 1600]}
                    target={{ value: settings.exams.sat.target, label: 'Target' }}
                    height={180}
                  />
                ) : (
                  <p className="text-sm text-muted">
                    Log your first Bluebook test in{' '}
                    <Link to="/practice" className="font-medium text-accent hover:underline">
                      Practice
                    </Link>{' '}
                    to see your trend.
                  </p>
                )}
              </div>
            </Card>
          )}

          <Link to="/scores" className="card group flex items-center justify-between gap-3 p-5 hover:bg-sunken">
            <span>
              <span className="block font-serif text-[16px] font-semibold">What does {settings.exams.sat.target} take?</span>
              <span className="text-[13px] text-muted">See your mistake budget per section in the Score Estimator.</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
      <p className="text-center text-[12px] text-muted">
        Next week starts {formatDate(addDays(startOfWeek(today), 7), 'short')}. Your data stays in this browser — export a backup from Settings.
      </p>
    </div>
  );
}
