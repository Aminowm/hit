import { CheckCircle2, Circle, NotebookPen, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarList } from '../components/charts';
import { askConfirm } from '../components/confirm';
import { RichText } from '../components/Tex';
import { Badge, Button, Card, CardHeader, cx, EmptyState, ExamTag, Field, IconButton, Modal, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { COURSES, TOPIC_INDEX } from '../data/topics';
import { daysBetween, formatDate, todayISO } from '../lib/dates';
import { unitLabel } from '../lib/progress';
import type { ExamId, Mistake, MistakeTag } from '../lib/types';
import { useActiveExams } from '../store/selectors';
import { useStore } from '../store/useStore';

const TAGS: Record<MistakeTag, { label: string; tip: string }> = {
  concept: { label: 'Concept gap', tip: 'Reteach the topic, then do 5 fresh problems on it.' },
  careless: { label: 'Careless slip', tip: 'Add a checking habit: re-read the question’s final ask, plug answers back in.' },
  misread: { label: 'Misread question', tip: 'Underline what is being asked (units, “NOT”, “which must be true”).' },
  time: { label: 'Time pressure', tip: 'Practise timed sets; learn to skip and return.' },
  formula: { label: 'Formula not recalled', tip: 'Add it to Flashcards and write it from memory daily for a week.' },
  calculator: { label: 'Calculator / Desmos', tip: 'Drill the specific Desmos or calculator technique until it is automatic.' },
  trap: { label: 'Fell for a trap answer', tip: 'Name the trap type (half-right, extreme wording, wrong sign) in the fix.' },
  guess: { label: 'Lucky guess', tip: 'Treat it as wrong: you got the point, but not the skill.' },
};

function AddMistake({ open, onClose, exams }: { open: boolean; onClose: () => void; exams: ExamId[] }) {
  const add = useStore((s) => s.addMistake);
  const [exam, setExam] = useState<ExamId>(exams[0] ?? 'sat');
  const [topicId, setTopicId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [source, setSource] = useState('');
  const [tags, setTags] = useState<MistakeTag[]>([]);
  const [what, setWhat] = useState('');
  const [fix, setFix] = useState('');
  const valid = what.trim() && tags.length > 0;

  const save = () => {
    if (!valid) return;
    add({ exam, topicId: topicId || undefined, date, source: source.trim(), tags, what: what.trim(), fix: fix.trim(), reviewed: false });
    setTopicId('');
    setSource('');
    setTags([]);
    setWhat('');
    setFix('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a mistake"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!valid}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Exam">
          {(id) => (
            <select
              id={id}
              className="field"
              value={exam}
              onChange={(e) => {
                setExam(e.target.value as ExamId);
                setTopicId('');
              }}
            >
              {exams.map((e) => (
                <option key={e} value={e}>
                  {EXAMS[e].name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Date">{(id) => <input id={id} type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
        <Field label="Topic" className="sm:col-span-2">
          {(id) => (
            <select id={id} className="field" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              <option value="">— Choose the skill/topic —</option>
              {COURSES[exam].units.map((u) => (
                <optgroup key={u.id} label={u.section ? `${u.section} · ${u.title}` : unitLabel(u)}>
                  {u.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code ? `${t.code} ` : ''}
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </Field>
        <Field label="Where" className="sm:col-span-2">
          {(id) => <input id={id} className="field" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Bluebook PT5 · Math M2 · Q17   or   2019 BC FRQ 6(c)" />}
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-[13px] font-medium text-ink-2">Why did it happen? (pick all that apply)</legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TAGS) as MistakeTag[]).map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTags((list) => (on ? list.filter((x) => x !== t) : [...list, t]))}
                  className={cx(
                    'rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors',
                    on ? 'border-transparent bg-accent text-accent-ink' : 'border-line-strong bg-surface text-ink-2 hover:bg-sunken',
                  )}
                >
                  {TAGS[t].label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Field label="What went wrong" className="sm:col-span-2" hint="Math works: $…$">
          {(id) => <textarea id={id} rows={3} className="field" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="I used the disc method about the x-axis, but the region rotates about y = −1…" />}
        </Field>
        <Field label="The fix / rule to remember" className="sm:col-span-2">
          {(id) => <textarea id={id} rows={2} className="field" value={fix} onChange={(e) => setFix(e.target.value)} placeholder="Measure R and r from the axis of rotation: R = f(x) + 1." />}
        </Field>
      </div>
    </Modal>
  );
}

function MistakeCard({ m, today }: { m: Mistake; today: string }) {
  const update = useStore((s) => s.updateMistake);
  const remove = useStore((s) => s.removeMistake);
  const ref = m.topicId ? TOPIC_INDEX.get(m.topicId) : undefined;
  const age = daysBetween(m.date, today);
  const due = !m.reviewed && age >= 3;
  return (
    <Card as="article" className={cx('p-5', m.reviewed && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => update(m.id, { reviewed: !m.reviewed })}
          aria-label={m.reviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
          className={cx('mt-0.5 shrink-0 rounded-full', m.reviewed ? 'text-good' : 'text-muted hover:text-ink')}
        >
          {m.reviewed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <ExamTag exam={m.exam} />
            {m.tags.map((t) => (
              <Badge key={t}>{TAGS[t].label}</Badge>
            ))}
            {due && <Badge tone="warn">Re-attempt now</Badge>}
          </div>
          {ref && (
            <Link to={`/topics/${ref.exam}#${ref.unit.id}`} className="mt-2 block text-[13px] font-medium text-accent hover:underline">
              {ref.topic.code ? `${ref.topic.code} · ` : ''}
              {ref.topic.title}
            </Link>
          )}
          <RichText text={m.what} className="mt-2 text-[14px]" />
          {m.fix && (
            <div className="mt-2.5 rounded-lg border-l-2 border-good bg-good-soft/60 px-3 py-2 text-[13.5px]">
              <span className="font-semibold text-good">Fix: </span>
              <RichText text={m.fix} className="inline text-ink-2" />
            </div>
          )}
          <p className="mt-2.5 text-[12px] text-muted">
            {formatDate(m.date)}
            {m.source ? ` · ${m.source}` : ''}
          </p>
        </div>
        <IconButton label="Delete mistake" onClick={async () => (await askConfirm({ title: 'Delete this mistake?', confirmLabel: 'Delete', danger: true })) && remove(m.id)}>
          <Trash2 size={15} />
        </IconButton>
      </div>
    </Card>
  );
}

export default function Mistakes() {
  const exams = useActiveExams();
  const mistakes = useStore((s) => s.mistakes);
  const [adding, setAdding] = useState(false);
  const [exam, setExam] = useState<ExamId | 'all'>('all');
  const [view, setView] = useState<'open' | 'reviewed' | 'all'>('open');
  const [tag, setTag] = useState<MistakeTag | 'all'>('all');
  const today = todayISO();

  const scoped = mistakes.filter((m) => exam === 'all' || m.exam === exam);
  const list = useMemo(
    () =>
      scoped
        .filter((m) => (view === 'all' ? true : view === 'open' ? !m.reviewed : m.reviewed))
        .filter((m) => tag === 'all' || m.tags.includes(tag))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [scoped, view, tag],
  );

  const tagCounts = (Object.keys(TAGS) as MistakeTag[])
    .map((t) => ({ tag: t, label: TAGS[t].label, value: scoped.filter((m) => m.tags.includes(t)).length, hint: TAGS[t].tip }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const topicCounts = new Map<string, number>();
  for (const m of scoped) if (m.topicId) topicCounts.set(m.topicId, (topicCounts.get(m.topicId) ?? 0) + 1);
  const hotTopics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topTag = tagCounts[0];

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Mistake Log"
        description="The fastest way to raise a score is to never make the same mistake twice. Log each miss, name why it happened, write the fix — then re-attempt it cold a few days later."
        actions={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Log mistake
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Segmented
          label="Status"
          value={view}
          onChange={setView}
          options={[
            { value: 'open', label: `To review (${scoped.filter((m) => !m.reviewed).length})` },
            { value: 'reviewed', label: 'Reviewed' },
            { value: 'all', label: 'All' },
          ]}
        />
        <select className="field w-auto" value={exam} onChange={(e) => setExam(e.target.value as ExamId | 'all')} aria-label="Exam">
          <option value="all">All exams</option>
          {exams.map((e) => (
            <option key={e} value={e}>
              {EXAMS[e].short}
            </option>
          ))}
        </select>
        <select className="field w-auto" value={tag} onChange={(e) => setTag(e.target.value as MistakeTag | 'all')} aria-label="Reason">
          <option value="all">Any reason</option>
          {(Object.keys(TAGS) as MistakeTag[]).map((t) => (
            <option key={t} value={t}>
              {TAGS[t].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3">
          {list.length ? (
            list.map((m) => <MistakeCard key={m.id} m={m} today={today} />)
          ) : (
            <Card>
              <EmptyState icon={<NotebookPen size={28} />} title={mistakes.length ? 'Nothing here' : 'No mistakes logged yet'}>
                {mistakes.length ? 'Try another filter.' : 'After every practice test, log each wrong answer (and every lucky guess) here.'}
              </EmptyState>
            </Card>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Why you lose points" subtitle={scoped.length ? `${scoped.length} logged` : undefined} />
            <div className="px-5 pb-5">
              {tagCounts.length ? (
                <>
                  <BarList rows={tagCounts} />
                  {topTag && (
                    <p className="mt-4 rounded-lg bg-sunken px-3 py-2.5 text-[13px] text-ink-2">
                      <span className="font-semibold text-ink">Top pattern — {topTag.label}: </span>
                      {topTag.hint}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">Patterns appear after a few entries.</p>
              )}
            </div>
          </Card>
          <Card>
            <CardHeader title="Problem topics" subtitle="Most-missed topics — drill these next." />
            <ul className="flex flex-col px-3 pb-4">
              {hotTopics.length ? (
                hotTopics.map(([id, n]) => {
                  const ref = TOPIC_INDEX.get(id);
                  if (!ref) return null;
                  return (
                    <li key={id}>
                      <Link to={`/topics/${ref.exam}#${ref.unit.id}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-[13.5px] hover:bg-sunken">
                        <span className="min-w-0 truncate">
                          {ref.topic.code ? `${ref.topic.code} ` : ''}
                          {ref.topic.title}
                        </span>
                        <Badge tone="bad">{n}×</Badge>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="px-2 text-sm text-muted">Tag mistakes with a topic to see hot spots.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      <AddMistake open={adding} onClose={() => setAdding(false)} exams={exams.length ? exams : ['sat']} />
    </>
  );
}
