import { ExternalLink, Plus, Target, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LineChart } from '../components/charts';
import { Badge, Button, Card, CardHeader, cx, EmptyState, ExamDot, ExamTag, Field, IconButton, Meter, Modal, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { FRQ_ARCHIVE, frqKey } from '../data/frqArchive';
import { RESOURCES } from '../data/resources';
import { formatDate, todayISO } from '../lib/dates';
import { AP_FORMATS, apScoreFromPercent } from '../lib/scoring';
import type { ExamId, PracticeEntry, PracticeKind } from '../lib/types';
import { useActiveExams } from '../store/selectors';
import { useStore } from '../store/useStore';

const KIND_LABEL: Record<PracticeKind, string> = {
  full: 'Full-length test',
  section: 'Single section',
  frq: 'FRQ set',
  qbank: 'Question set',
};

function entryScore(p: PracticeEntry): string {
  if (p.exam === 'sat' && p.rw && p.math) return `${p.rw + p.math} (${p.rw} R&W · ${p.math} M)`;
  if (p.exam === 'sat' && (p.rw || p.math)) return `${p.rw ? `${p.rw} R&W` : `${p.math} Math`}`;
  if (p.percent !== undefined) return `${Math.round(p.percent)}% → est. ${apScoreFromPercent(p.exam, p.percent)}`;
  if (p.correct !== undefined && p.total) return `${p.correct}/${p.total} (${Math.round((p.correct / p.total) * 100)}%)`;
  return '—';
}

function AddEntry({ open, onClose, exams }: { open: boolean; onClose: () => void; exams: ExamId[] }) {
  const add = useStore((s) => s.addPractice);
  const addSession = useStore((s) => s.addSession);
  const [exam, setExam] = useState<ExamId>(exams[0] ?? 'sat');
  const [kind, setKind] = useState<PracticeKind>('full');
  const [date, setDate] = useState(todayISO());
  const [source, setSource] = useState('');
  const [rw, setRw] = useState('');
  const [math, setMath] = useState('');
  const [percent, setPercent] = useState('');
  const [correct, setCorrect] = useState('');
  const [total, setTotal] = useState('');
  const [minutes, setMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [logTime, setLogTime] = useState(true);

  const isSat = exam === 'sat';
  const scaled = isSat && (kind === 'full' || kind === 'section');
  const usesPercent = !isSat && (kind === 'full' || kind === 'section');
  const n = (v: string) => (v.trim() === '' ? undefined : Number(v));

  const valid =
    source.trim() &&
    (scaled ? (n(rw) ?? n(math)) !== undefined : usesPercent ? n(percent) !== undefined : n(correct) !== undefined && (n(total) ?? 0) > 0);

  const save = () => {
    if (!valid) return;
    add({
      date,
      exam,
      kind,
      source: source.trim(),
      rw: scaled ? n(rw) : undefined,
      math: scaled ? n(math) : undefined,
      percent: usesPercent ? n(percent) : undefined,
      correct: !scaled && !usesPercent ? n(correct) : undefined,
      total: !scaled && !usesPercent ? n(total) : undefined,
      minutes: n(minutes),
      notes: notes.trim() || undefined,
    });
    if (logTime && n(minutes)) addSession({ date, exam, minutes: n(minutes)!, kind: 'manual' });
    setSource('');
    setRw('');
    setMath('');
    setPercent('');
    setCorrect('');
    setTotal('');
    setMinutes('');
    setNotes('');
    onClose();
  };

  const suggestions = isSat
    ? ['Bluebook Practice Test', 'Question Bank — Hard', 'Barron’s practice test']
    : ['AP Classroom Progress Check', `${new Date().getFullYear() - 1} released FRQs`, 'Barron’s practice exam', 'Princeton Review practice test'];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log practice"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!valid}>
            Save entry
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Exam">
          {(id) => (
            <select id={id} className="field" value={exam} onChange={(e) => setExam(e.target.value as ExamId)}>
              {exams.map((e) => (
                <option key={e} value={e}>
                  {EXAMS[e].name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Type">
          {(id) => (
            <select id={id} className="field" value={kind} onChange={(e) => setKind(e.target.value as PracticeKind)}>
              {(Object.keys(KIND_LABEL) as PracticeKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Date">{(id) => <input id={id} type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label="Source">
          {(id) => (
            <>
              <input id={id} list="practice-sources" className="field" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Bluebook Practice Test 6" />
              <datalist id="practice-sources">
                {suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </>
          )}
        </Field>
        {scaled && (
          <>
            <Field label="Reading & Writing (200–800)">
              {(id) => <input id={id} type="number" min={200} max={800} step={10} className="field" value={rw} onChange={(e) => setRw(e.target.value)} />}
            </Field>
            <Field label="Math (200–800)">
              {(id) => <input id={id} type="number" min={200} max={800} step={10} className="field" value={math} onChange={(e) => setMath(e.target.value)} />}
            </Field>
          </>
        )}
        {usesPercent && (
          <Field
            label="Composite score (%)"
            className="sm:col-span-2"
            hint={
              <>
                Compute it from MCQ correct + FRQ points in the{' '}
                <Link to="/scores" className="text-accent hover:underline" onClick={onClose}>
                  Score Estimator
                </Link>
                .
              </>
            }
          >
            {(id) => <input id={id} type="number" min={0} max={100} className="field" value={percent} onChange={(e) => setPercent(e.target.value)} />}
          </Field>
        )}
        {!scaled && !usesPercent && (
          <>
            <Field label={kind === 'frq' ? 'Points earned' : 'Correct'}>
              {(id) => <input id={id} type="number" min={0} className="field" value={correct} onChange={(e) => setCorrect(e.target.value)} />}
            </Field>
            <Field label={kind === 'frq' ? 'Points possible' : 'Questions'}>
              {(id) => <input id={id} type="number" min={1} className="field" value={total} onChange={(e) => setTotal(e.target.value)} />}
            </Field>
          </>
        )}
        <Field label="Time spent (minutes)">
          {(id) => <input id={id} type="number" min={0} className="field" value={minutes} onChange={(e) => setMinutes(e.target.value)} />}
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-[13px] text-ink-2">
          <input type="checkbox" checked={logTime} onChange={(e) => setLogTime(e.target.checked)} className="accent-[var(--accent)]" />
          Count toward study time
        </label>
        <Field label="Notes" className="sm:col-span-2">
          {(id) => <textarea id={id} rows={2} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pacing, weak spots, what to drill next…" />}
        </Field>
      </div>
    </Modal>
  );
}

function FrqArchive({ exams }: { exams: ExamId[] }) {
  const done = useStore((s) => s.frqDone);
  const toggle = useStore((s) => s.toggleFrq);
  const apExams = exams.filter((e) => FRQ_ARCHIVE[e]);
  const [exam, setExam] = useState<ExamId>(apExams[0] ?? 'calcbc');
  const years = FRQ_ARCHIVE[exam] ?? [];
  const total = years.reduce((s, y) => s + y.questions, 0);
  const completed = years.reduce((s, y) => s + Array.from({ length: y.questions }, (_, i) => done[frqKey(exam, y.year, i + 1)]).filter(Boolean).length, 0);
  const link = RESOURCES.find((r) => r.exams.includes(exam) && r.id.endsWith('frqs'))?.url;

  if (!apExams.length) return <EmptyState title="No AP exams active">Turn one on in Settings.</EmptyState>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Exam"
          value={exam}
          onChange={setExam}
          options={apExams.map((e) => ({
            value: e,
            label: (
              <>
                <ExamDot exam={e} className="size-2" /> {EXAMS[e].short}
              </>
            ),
          }))}
        />
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
            Open on AP Central <ExternalLink size={13} />
          </a>
        )}
      </div>
      <Card className="p-5">
        <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
          <span className="text-ink-2">
            <span className="num font-semibold text-ink">{completed}</span> of {total} released questions done
          </span>
          <span className="num font-semibold">{Math.round((completed / Math.max(1, total)) * 100)}%</span>
        </div>
        <Meter value={completed / Math.max(1, total)} color={`var(--exam-${exam})`} label="FRQ archive progress" />
        <p className="mt-3 text-[12.5px] text-muted">
          Coach’s order: start with the most recent years (closest to the current format), do them timed, grade with the official scoring
          guidelines, and log the points in your Practice Log.
        </p>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="px-5 py-2.5 font-medium">Year</th>
              <th className="px-2 py-2.5 font-medium">Questions</th>
              <th className="px-5 py-2.5 text-right font-medium">Done</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => {
              const qs = Array.from({ length: y.questions }, (_, i) => i + 1);
              const n = qs.filter((q) => done[frqKey(exam, y.year, q)]).length;
              return (
                <tr key={y.year} className="border-b border-line last:border-b-0">
                  <td className="num px-5 py-2 font-semibold">
                    {y.year}
                    {exam !== 'calcbc' && y.year === 2025 && <Badge tone="accent" className="ml-2">New format</Badge>}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {qs.map((q) => {
                        const key = frqKey(exam, y.year, q);
                        const on = !!done[key];
                        return (
                          <button
                            key={q}
                            type="button"
                            aria-pressed={on}
                            aria-label={`${y.year} question ${q}`}
                            onClick={() => toggle(key)}
                            className={cx(
                              'num size-8 rounded-lg border text-[12.5px] font-semibold transition-colors',
                              on ? 'border-transparent text-white' : 'border-line-strong bg-surface text-ink-2 hover:bg-sunken',
                            )}
                            style={on ? { background: `var(--exam-${exam})` } : undefined}
                          >
                            {q}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="num px-5 py-2 text-right text-muted">
                    {n}/{y.questions}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function Practice() {
  const exams = useActiveExams();
  const practice = useStore((s) => s.practice);
  const remove = useStore((s) => s.removePractice);
  const satTarget = useStore((s) => s.settings.exams.sat.target);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'frq' ? 'frq' : 'log';
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<ExamId | 'all'>('all');

  const sorted = useMemo(
    () => [...practice].filter((p) => filter === 'all' || p.exam === filter).sort((a, b) => b.date.localeCompare(a.date)),
    [practice, filter],
  );

  const satPoints = practice.filter((p) => p.exam === 'sat' && p.rw && p.math).map((p) => ({ date: p.date, value: p.rw! + p.math! }));
  const apSeries = exams
    .filter((e) => e !== 'sat')
    .map((e) => ({
      id: e,
      label: EXAMS[e].short,
      color: `var(--exam-${e})`,
      points: practice.filter((p) => p.exam === e && p.percent !== undefined).map((p) => ({ date: p.date, value: p.percent! })),
    }))
    .filter((s) => s.points.length);

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Practice Log"
        description="Every full test, section, FRQ set and question set in one place — so you can see the trend, not just the last score."
        actions={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Log practice
          </Button>
        }
      />

      <Segmented
        label="View"
        className="mb-5"
        value={tab}
        onChange={(t) => setParams(t === 'frq' ? { tab: 'frq' } : {})}
        options={[
          { value: 'log', label: 'Scores & log' },
          { value: 'frq', label: 'Past FRQ archive' },
        ]}
      />

      {tab === 'frq' ? (
        <FrqArchive exams={exams} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {exams.includes('sat') && (
              <Card>
                <CardHeader title="SAT totals" subtitle={`Full-length tests · target ${satTarget}`} />
                <div className="px-5 pb-5">
                  {satPoints.length ? (
                    <LineChart
                      ariaLabel="SAT practice totals over time"
                      series={[{ id: 'sat', label: 'SAT total', color: 'var(--exam-sat)', points: satPoints }]}
                      domain={[Math.max(400, Math.min(satTarget, ...satPoints.map((p) => p.value)) - 80), 1600]}
                      target={{ value: satTarget, label: 'Target' }}
                    />
                  ) : (
                    <p className="text-sm text-muted">Log a full Bluebook test with both section scores to start the trend line.</p>
                  )}
                </div>
              </Card>
            )}
            <Card>
              <CardHeader
                title="AP composite %"
                subtitle={apSeries.length ? `5 cutoffs (approx.): ${apSeries.map((s) => `${s.label} ${AP_FORMATS[s.id as ExamId]?.cutoffs[5]}%`).join(' · ')}` : 'Full or section practice exams'}
              />
              <div className="px-5 pb-5">
                {apSeries.length ? (
                  <LineChart ariaLabel="AP practice composite percentages over time" series={apSeries} domain={[0, 100]} format={(v) => `${Math.round(v)}%`} />
                ) : (
                  <p className="text-sm text-muted">Log a practice exam with its composite % to start the trend line.</p>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="All entries"
              icon={<Target size={17} />}
              action={
                <select className="field h-8 w-auto py-0 text-[13px]" value={filter} onChange={(e) => setFilter(e.target.value as ExamId | 'all')} aria-label="Filter by exam">
                  <option value="all">All exams</option>
                  {exams.map((e) => (
                    <option key={e} value={e}>
                      {EXAMS[e].short}
                    </option>
                  ))}
                </select>
              }
            />
            {sorted.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-[13.5px]">
                  <thead>
                    <tr className="border-y border-line text-left text-[12.5px] text-muted">
                      <th className="px-5 py-2 font-medium">Date</th>
                      <th className="px-2 py-2 font-medium">Exam</th>
                      <th className="px-2 py-2 font-medium">Source</th>
                      <th className="px-2 py-2 font-medium">Score</th>
                      <th className="px-2 py-2 font-medium">Time</th>
                      <th className="px-5 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p) => (
                      <tr key={p.id} className="border-b border-line align-top last:border-b-0">
                        <td className="num px-5 py-2.5 whitespace-nowrap text-ink-2">{formatDate(p.date)}</td>
                        <td className="px-2 py-2.5">
                          <ExamTag exam={p.exam} />
                        </td>
                        <td className="px-2 py-2.5">
                          <p className="font-medium">{p.source}</p>
                          <p className="text-[12px] text-muted">
                            {KIND_LABEL[p.kind]}
                            {p.notes ? ` · ${p.notes}` : ''}
                          </p>
                        </td>
                        <td className="num px-2 py-2.5 font-semibold whitespace-nowrap">{entryScore(p)}</td>
                        <td className="num px-2 py-2.5 text-muted">{p.minutes ? `${p.minutes}m` : '—'}</td>
                        <td className="px-5 py-1.5 text-right">
                          <IconButton label="Delete entry" onClick={() => confirm('Delete this entry?') && remove(p.id)}>
                            <Trash2 size={15} />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={<Target size={28} />} title="No practice logged yet">
                Start with a full Bluebook test — it’s the most accurate predictor of your SAT score.
              </EmptyState>
            )}
          </Card>
        </div>
      )}

      <AddEntry open={adding} onClose={() => setAdding(false)} exams={exams.length ? exams : ['sat']} />
    </>
  );
}
