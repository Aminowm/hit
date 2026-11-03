import { Bell, Pause, Play, RotateCcw, SkipForward, Square } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, Button, buttonClass, Card, CardHeader, cx, ExamDot, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { formatClock, formatMinutes, todayISO } from '../lib/dates';
import type { ExamId } from '../lib/types';
import { useActiveExams } from '../store/selectors';
import { useStore } from '../store/useStore';
import { mockRemaining, PHASE_LABEL, pomRemaining, requestNotifications, useNow, useTimer, type PomPhase } from '../store/useTimer';

function Ring({ progress, color, children }: { progress: number; color: string; children: React.ReactNode }) {
  const r = 108;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]">
      <svg viewBox="0 0 240 240" className="size-full -rotate-90" aria-hidden>
        <circle cx="120" cy="120" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))}
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function Pomodoro() {
  const exams = useActiveExams();
  const pom = useTimer((s) => s.pom);
  const { pomStart, pomPause, pomReset, pomSkip, pomSetExam } = useTimer.getState();
  const durations = useStore((s) => s.settings.pomodoro);
  const sessions = useStore((s) => s.sessions);
  const now = useNow(250);
  const remaining = pomRemaining(pom, now);
  const total = (pom.phase === 'focus' ? durations.focus : pom.phase === 'short' ? durations.short : durations.long) * 60_000;
  const today = todayISO();
  const focusToday = sessions.filter((s) => s.date === today && s.kind === 'pomodoro').reduce((a, s) => a + s.minutes, 0);
  const color = pom.phase === 'focus' ? 'var(--accent)' : 'var(--good)';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card className="flex flex-col items-center gap-6 px-5 py-8">
        <Segmented
          label="Phase"
          value={pom.phase}
          onChange={(p: PomPhase) => pomReset(p)}
          options={(['focus', 'short', 'long'] as PomPhase[]).map((p) => ({ value: p, label: PHASE_LABEL[p] }))}
        />
        <Ring progress={1 - remaining / total} color={color}>
          <p className="num font-mono text-[56px] leading-none font-medium tracking-tight">{formatClock(remaining)}</p>
          <p className="mt-2 text-[13px] text-muted">
            {PHASE_LABEL[pom.phase]}
            {pom.exam ? ` · ${EXAMS[pom.exam].short}` : ''}
          </p>
        </Ring>
        <div className="flex items-center gap-2">
          {pom.running ? (
            <Button variant="primary" onClick={pomPause} className="w-32">
              <Pause size={16} /> Pause
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-32"
              onClick={() => {
                requestNotifications();
                pomStart();
              }}
            >
              <Play size={16} /> {remaining < total ? 'Resume' : 'Start'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => pomReset()} aria-label="Reset">
            <RotateCcw size={16} />
          </Button>
          <Button variant="secondary" onClick={pomSkip} aria-label="Skip to next phase">
            <SkipForward size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`${pom.cycle % durations.longEvery} of ${durations.longEvery} focus blocks before a long break`}>
          {Array.from({ length: durations.longEvery }, (_, i) => (
            <span key={i} className={cx('size-2.5 rounded-full', i < pom.cycle % durations.longEvery ? 'bg-accent' : 'bg-line-strong')} />
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="What are you studying?" subtitle="Focus blocks are logged to this exam automatically." />
          <div className="flex flex-wrap gap-2 px-5 pb-5">
            <button
              type="button"
              onClick={() => pomSetExam(null)}
              className={cx('rounded-full border px-3 py-1.5 text-[13px] font-medium', pom.exam === null ? 'border-transparent bg-accent text-accent-ink' : 'border-line-strong hover:bg-sunken')}
            >
              General
            </button>
            {exams.map((e: ExamId) => (
              <button
                key={e}
                type="button"
                onClick={() => pomSetExam(e)}
                className={cx(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium',
                  pom.exam === e ? 'border-transparent bg-accent text-accent-ink' : 'border-line-strong hover:bg-sunken',
                )}
              >
                <ExamDot exam={e} className="size-2" /> {EXAMS[e].short}
              </button>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-[12.5px] text-muted">Focus time today</p>
          <p className="font-serif text-[28px] font-semibold">{formatMinutes(focusToday)}</p>
          <p className="mt-3 text-[13px] text-ink-2">
            {durations.focus}-minute focus · {durations.short}-minute breaks · long break ({durations.long} min) every {durations.longEvery} blocks.{' '}
            <Link to="/settings" className="text-accent hover:underline">
              Change
            </Link>
          </p>
          <p className="mt-3 flex items-start gap-2 text-[12.5px] text-muted">
            <Bell size={14} className="mt-0.5 shrink-0" /> A chime plays when a block ends; allow notifications to get alerts in other tabs.
          </p>
        </Card>
      </div>
    </div>
  );
}

const MOCK_TIPS: Record<ExamId, string> = {
  sat: 'Use Bluebook for the real adaptive test. This timer is for paper practice tests or Question Bank module simulations — you cannot return to Module 1 once it ends.',
  calcbc: 'Do Part A without a calculator. When the clock hits 0, pens down — partial FRQ answers still score.',
  phys1: 'Practise budgeting ~25 minutes per FRQ. Show the starting equation before substituting numbers.',
  physc: 'Budget ~25 minutes per FRQ. Derivations earn points even when the final number is wrong.',
};

function MockExam() {
  const exams = useActiveExams();
  const mock = useTimer((s) => s.mock);
  const { mockLoad, mockStart, mockPause, mockNext, mockStop } = useTimer.getState();
  const now = useNow(250);

  if (!mock.exam) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {exams.map((e) => {
          const def = EXAMS[e];
          const testing = def.sections.filter((s) => !s.isBreak).reduce((a, s) => a + s.minutes, 0);
          return (
            <Card key={e} className="flex flex-col p-5">
              <p className="flex items-center gap-2 text-[14px] font-semibold">
                <ExamDot exam={e} /> {def.name}
              </p>
              <p className="mt-1 text-[13px] text-muted">{formatMinutes(testing)} of testing</p>
              <ol className="mt-3 flex flex-1 flex-col gap-1 text-[12.5px] text-ink-2">
                {def.sections.map((s) => (
                  <li key={s.name} className="flex justify-between gap-2">
                    <span className={cx(s.isBreak && 'text-muted')}>{s.name}</span>
                    <span className="num shrink-0 text-muted">{s.minutes}m</span>
                  </li>
                ))}
              </ol>
              <Button variant="primary" className="mt-4" onClick={() => mockLoad(e)}>
                Set up mock
              </Button>
            </Card>
          );
        })}
      </div>
    );
  }

  const def = EXAMS[mock.exam];
  const section = def.sections[mock.index];
  const remaining = mockRemaining(mock, now);
  const total = (section?.minutes ?? 1) * 60_000;
  const leftAfter = def.sections.slice(mock.index + 1).reduce((a, s) => a + s.minutes, 0) * 60_000;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card className="flex flex-col items-center gap-6 px-5 py-8">
        <div className="text-center">
          <p className="flex items-center justify-center gap-2 text-[13px] font-medium text-muted">
            <ExamDot exam={mock.exam} /> {def.name} · mock exam
          </p>
          {mock.finished ? (
            <h2 className="mt-1 font-serif text-[22px] font-semibold">Exam complete</h2>
          ) : (
            <h2 className="mt-1 font-serif text-[22px] font-semibold">{section?.name}</h2>
          )}
          {!mock.finished && section?.note && <p className="mt-1 text-[13px] text-ink-2">{section.note}</p>}
        </div>
        <Ring progress={mock.finished ? 1 : 1 - remaining / total} color={`var(--exam-${mock.exam})`}>
          {mock.finished ? (
            <p className="font-serif text-[22px] font-semibold">Pens down</p>
          ) : (
            <>
              <p className="num font-mono text-[52px] leading-none font-medium tracking-tight">{formatClock(remaining)}</p>
              <p className="mt-2 text-[13px] text-muted">
                {section?.questions ? `${section.questions} questions · ` : ''}+{formatClock(leftAfter)} after
              </p>
            </>
          )}
        </Ring>
        {mock.finished ? (
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/scores" className={buttonClass('primary')}>
              Estimate your score
            </Link>
            <Button onClick={mockStop}>Done</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {mock.running ? (
              <Button variant="primary" className="w-32" onClick={mockPause}>
                <Pause size={16} /> Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-32"
                onClick={() => {
                  requestNotifications();
                  mockStart();
                }}
              >
                <Play size={16} /> {remaining < total ? 'Resume' : 'Start'}
              </Button>
            )}
            <Button onClick={mockNext} aria-label="Next section">
              <SkipForward size={16} /> Next
            </Button>
            <Button variant="ghost" onClick={() => confirm('Stop this mock exam?') && mockStop()} aria-label="Stop mock exam">
              <Square size={15} />
            </Button>
          </div>
        )}
      </Card>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Sections" subtitle="Sections advance automatically, like the real exam." />
          <ol className="flex flex-col px-3 pb-3">
            {def.sections.map((s, i) => {
              const state = mock.finished || i < mock.index ? 'done' : i === mock.index ? 'now' : 'next';
              return (
                <li key={s.name} className={cx('flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-[13.5px]', state === 'now' && 'bg-sunken')}>
                  <span className={cx('min-w-0', state === 'done' && 'text-muted line-through')}>
                    {s.name}
                    {s.questions ? <span className="text-muted"> · {s.questions} q</span> : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {state === 'now' && <Badge tone="accent">Now</Badge>}
                    <span className="num text-muted">{s.minutes}m</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>
        <Card className="p-5 text-[13.5px] text-ink-2">
          <p className="font-semibold text-ink">Exam-day habit</p>
          <p className="mt-1">{MOCK_TIPS[mock.exam]}</p>
        </Card>
      </div>
    </div>
  );
}

export default function TimerPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'mock' ? 'mock' : 'pomodoro';
  return (
    <>
      <PageHeader
        eyebrow="Plan"
        title="Timer"
        description="Pomodoro blocks for daily study, and a mock-exam timer that runs every section with official timing. Timers keep running while you use other pages."
      />
      <Segmented
        label="Timer"
        className="mb-5"
        value={tab}
        onChange={(t) => setParams(t === 'mock' ? { tab: 'mock' } : {})}
        options={[
          { value: 'pomodoro', label: 'Pomodoro' },
          { value: 'mock', label: 'Mock exam' },
        ]}
      />
      {tab === 'mock' ? <MockExam /> : <Pomodoro />}
    </>
  );
}
