import { Layers, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RichText } from '../components/Tex';
import { Badge, Button, Card, CardHeader, cx, EmptyState, ExamDot, ExamTag, Field, IconButton, PageHeader, Segmented, Stat } from '../components/ui';
import { EXAMS } from '../data/exams';
import { todayISO } from '../lib/dates';
import { intervalLabel, review } from '../lib/srs';
import type { ExamId, Flashcard, SrsGrade } from '../lib/types';
import { useActiveExams, useAllCards, useStudyQueue } from '../store/selectors';
import { useStore } from '../store/useStore';

const GRADES: { grade: SrsGrade; label: string; key: string; className: string }[] = [
  { grade: 'again', label: 'Again', key: '1', className: 'border-bad/40 text-bad hover:bg-bad-soft' },
  { grade: 'hard', label: 'Hard', key: '2', className: 'border-warn/40 text-warn hover:bg-warn-soft' },
  { grade: 'good', label: 'Good', key: '3', className: 'border-good/40 text-good hover:bg-good-soft' },
  { grade: 'easy', label: 'Easy', key: '4', className: 'border-line-strong text-ink-2 hover:bg-sunken' },
];

function ReviewSession({ exams, onDone }: { exams: ExamId[]; onDone: () => void }) {
  const queue = useStudyQueue(exams);
  const srs = useStore((s) => s.srs);
  const grade = useStore((s) => s.gradeCard);
  // Snapshot the queue when the session starts so grading doesn't reshuffle it.
  const [ids, setIds] = useState<string[]>(() => [...queue.due, ...queue.fresh].map((c) => c.id));
  const [cardMap] = useState(() => new Map([...queue.due, ...queue.fresh].map((c) => [c.id, c])));
  const [pos, setPos] = useState(0);
  const [shown, setShown] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const card: Flashcard | undefined = cardMap.get(ids[pos]);
  const today = todayISO();

  const answer = useCallback(
    (g: SrsGrade) => {
      if (!card) return;
      grade(card.id, g);
      setReviewed((n) => n + 1);
      // "Again" cards come back once more at the end of this session.
      if (g === 'again') setIds((list) => [...list, card.id]);
      setPos((p) => p + 1);
      setShown(false);
    },
    [card, grade],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (!card) return;
      if (!shown && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setShown(true);
      } else if (shown) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) answer(g.grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, shown, answer]);

  if (!card) {
    return (
      <Card>
        <EmptyState icon={<Layers size={28} />} title={reviewed ? `Session complete — ${reviewed} reviews` : 'Nothing due right now'}>
          {reviewed ? 'Cards you knew well will come back in a few days; misses come back tomorrow.' : 'Come back tomorrow, or add your own cards below.'}
          <div className="mt-4">
            <Button onClick={onDone}>Back to decks</Button>
          </div>
        </EmptyState>
      </Card>
    );
  }

  const state = srs[card.id];
  const isNew = !state;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between text-[13px] text-muted">
        <span className="flex items-center gap-2">
          <ExamTag exam={card.exam} /> <Badge>{card.deck}</Badge> {isNew && <Badge tone="accent">New</Badge>}
        </span>
        <span className="num">
          {pos + 1} / {ids.length}
        </span>
      </div>
      <Card className="flex min-h-[320px] flex-col p-6 sm:p-8">
        <RichText text={card.front} className="font-serif text-[22px] leading-snug font-semibold" />
        {shown ? (
          <div className="mt-6 border-t border-line pt-5">
            <RichText text={card.back} className="text-[16px] leading-relaxed text-ink-2" />
          </div>
        ) : (
          <div className="mt-auto pt-8">
            <Button variant="primary" className="w-full" onClick={() => setShown(true)}>
              Show answer <kbd className="ml-1 rounded border border-white/30 px-1 font-mono text-[11px] opacity-80">Space</kbd>
            </Button>
          </div>
        )}
      </Card>
      {shown && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map((g) => (
            <button
              key={g.grade}
              type="button"
              onClick={() => answer(g.grade)}
              className={cx('flex h-14 flex-col items-center justify-center rounded-xl border bg-surface font-medium transition-colors', g.className)}
            >
              <span className="text-[14px]">{g.label}</span>
              <span className="num text-[11.5px] opacity-80">
                {intervalLabel(review(state, g.grade, today).interval)} · key {g.key}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="text-center">
        <button type="button" onClick={onDone} className="text-[13px] text-muted hover:text-ink">
          End session
        </button>
      </div>
    </div>
  );
}

function AddCard({ exams }: { exams: ExamId[] }) {
  const addCard = useStore((s) => s.addCard);
  const [exam, setExam] = useState<ExamId>(exams[0] ?? 'sat');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const save = () => {
    if (!front.trim() || !back.trim()) return;
    addCard({ exam, deck: 'My cards', front: front.trim(), back: back.trim() });
    setFront('');
    setBack('');
  };
  return (
    <Card>
      <CardHeader title="Add a card" subtitle={<>Use $…$ for inline math and $$…$$ for display math, e.g. $\int_0^1 x^2\,dx$.</>} />
      <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
        <Field label="Front (question)">{(id) => <textarea id={id} rows={3} className="field" value={front} onChange={(e) => setFront(e.target.value)} />}</Field>
        <Field label="Back (answer)">{(id) => <textarea id={id} rows={3} className="field" value={back} onChange={(e) => setBack(e.target.value)} />}</Field>
        {(front || back) && (
          <div className="grid gap-3 rounded-xl border border-dashed border-line-strong p-4 md:col-span-2 md:grid-cols-2">
            <div>
              <p className="eyebrow mb-1">Preview · front</p>
              <RichText text={front} className="font-serif text-[16px] font-semibold" />
            </div>
            <div>
              <p className="eyebrow mb-1">Preview · back</p>
              <RichText text={back} className="text-[14px] text-ink-2" />
            </div>
          </div>
        )}
        <div className="flex items-end gap-2 md:col-span-2">
          <Field label="Exam" className="w-48">
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
          <Button variant="primary" onClick={save} disabled={!front.trim() || !back.trim()}>
            <Plus size={16} /> Add card
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Flashcards() {
  const active = useActiveExams();
  const [scope, setScope] = useState<ExamId | 'all'>('all');
  const [studying, setStudying] = useState(false);
  const exams = useMemo(() => (scope === 'all' ? active : [scope]), [scope, active]);
  const queue = useStudyQueue(exams);
  const cards = useAllCards();
  const srs = useStore((s) => s.srs);
  const newPerDay = useStore((s) => s.settings.newCardsPerDay);
  const custom = useStore((s) => s.customCards);
  const removeCard = useStore((s) => s.removeCard);

  const inScope = cards.filter((c) => exams.includes(c.exam));
  const learned = inScope.filter((c) => srs[c.id]).length;
  const mature = inScope.filter((c) => (srs[c.id]?.interval ?? 0) >= 21).length;

  if (studying) return <ReviewSession exams={exams} onDone={() => setStudying(false)} />;

  return (
    <>
      <PageHeader
        eyebrow="Study"
        title="Flashcards"
        description={`Spaced repetition on every formula plus key concepts and justifications. ${newPerDay} new cards a day; reviews come back just before you would forget them.`}
      />

      <Segmented
        label="Deck"
        className="mb-5"
        value={scope}
        onChange={setScope}
        options={[
          { value: 'all' as const, label: 'All decks' },
          ...active.map((e) => ({
            value: e,
            label: (
              <>
                <ExamDot exam={e} className="size-2" /> {EXAMS[e].short}
              </>
            ),
          })),
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="flex flex-col justify-between gap-6 p-6">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Due reviews" value={queue.due.length} />
            <Stat label="New today" value={queue.fresh.length} hint={`${queue.newToday} already started`} />
            <Stat label="Learned" value={`${learned}/${inScope.length}`} hint={`${mature} mature (≥ 3 wk)`} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => setStudying(true)} disabled={!queue.due.length && !queue.fresh.length}>
              <Layers size={16} /> Study {queue.due.length + queue.fresh.length} cards
            </Button>
            <span className="text-[12.5px] text-muted">Keys: Space to flip · 1 Again · 2 Hard · 3 Good · 4 Easy</span>
          </div>
        </Card>
        <Card className="p-6 text-[13.5px] text-ink-2">
          <h2 className="mb-2 font-serif text-[16px] font-semibold text-ink">How to grade honestly</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 marker:text-muted">
            <li>
              <b>Again</b> — you couldn’t produce it (or got a sign/constant wrong).
            </li>
            <li>
              <b>Hard</b> — correct, but slow or with hesitation.
            </li>
            <li>
              <b>Good</b> — correct after a moment’s thought.
            </li>
            <li>
              <b>Easy</b> — instant; you’d bet on it in the exam.
            </li>
          </ul>
          <p className="mt-3 text-muted">Write the formula on paper before flipping — recall beats recognition.</p>
        </Card>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <AddCard exams={active.length ? active : ['sat']} />
        {custom.length > 0 && (
          <Card>
            <CardHeader title="My cards" subtitle={`${custom.length} custom cards`} />
            <ul className="divide-y divide-line">
              {custom.map((c) => (
                <li key={c.id} className="flex items-start gap-3 px-5 py-3">
                  <ExamDot exam={c.exam} className="mt-2" />
                  <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-2 sm:gap-4">
                    <RichText text={c.front} className="text-[14px] font-medium" />
                    <RichText text={c.back} className="text-[13.5px] text-ink-2" />
                  </div>
                  <IconButton label="Delete card" onClick={() => confirm('Delete this card and its review history?') && removeCard(c.id)}>
                    <Trash2 size={16} />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <ResetProgress exams={exams} />
      </div>
    </>
  );
}

function ResetProgress({ exams }: { exams: ExamId[] }) {
  const cards = useAllCards();
  const srs = useStore((s) => s.srs);
  const has = cards.some((c) => exams.includes(c.exam) && srs[c.id]);
  if (!has) return null;
  const reset = () => {
    if (!confirm('Reset review history for the selected decks? Cards will be treated as new again.')) return;
    const ids = new Set(cards.filter((c) => exams.includes(c.exam)).map((c) => c.id));
    useStore.setState((st) => ({ srs: Object.fromEntries(Object.entries(st.srs).filter(([id]) => !ids.has(id))) }));
  };
  return (
    <div className="text-right">
      <Button variant="ghost" size="sm" onClick={reset}>
        <RotateCcw size={14} /> Reset review history for these decks
      </Button>
    </div>
  );
}
