import { Check, ChevronDown, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge, Card, cx, ExamDot, Meter, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { COURSES } from '../data/topics';
import { courseMastery, isNumberedUnit, nextStatus, STATUS_LABEL, STATUS_ORDER, statusCounts, statusOf, unitMastery } from '../lib/progress';
import type { ExamId, Topic, TopicStatus, Unit } from '../lib/types';
import { useActiveExams } from '../store/selectors';
import { useStore } from '../store/useStore';

const STATUS_HELP: Record<TopicStatus, string> = {
  'not-started': 'Haven’t studied it yet.',
  learning: 'Seen it in class or a video; still need notes or examples.',
  practiced: 'Can solve standard problems with an occasional slip.',
  mastered: '≥ 80% on timed, mixed questions (e.g. an AP Progress Check or Hard SAT set).',
};

function StatusPill({ status, exam, onClick, label }: { status: TopicStatus; exam: ExamId; onClick: () => void; label: string }) {
  const level = STATUS_ORDER.indexOf(status);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${STATUS_LABEL[status]}. Click to change.`}
      title="Click to advance status"
      className={cx(
        'inline-flex h-7 w-[118px] shrink-0 items-center gap-2 rounded-full border px-2.5 text-[12px] font-medium transition-colors',
        status === 'mastered' ? 'border-transparent bg-good-soft text-good' : 'border-line-strong bg-surface text-ink-2 hover:bg-sunken',
      )}
    >
      {status === 'mastered' ? (
        <Check size={14} strokeWidth={2.5} />
      ) : (
        <span className="flex gap-[3px]" aria-hidden>
          {[1, 2, 3].map((i) => (
            <span key={i} className="h-2.5 w-1.5 rounded-[2px]" style={{ background: i <= level ? `var(--exam-${exam})` : 'var(--line-strong)' }} />
          ))}
        </span>
      )}
      {STATUS_LABEL[status]}
    </button>
  );
}

function TopicRow({ topic, exam }: { topic: Topic; exam: ExamId }) {
  const status = useStore((s) => statusOf(s.topics, topic.id));
  const setStatus = useStore((s) => s.setTopicStatus);
  return (
    <li className="flex items-start gap-3 border-t border-line px-5 py-2.5 first:border-t-0">
      <StatusPill status={status} exam={exam} label={topic.title} onClick={() => setStatus(topic.id, nextStatus(status))} />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className={cx('text-[14px]', status === 'mastered' && 'text-ink-2')}>
          {topic.code && <span className="num mr-2 font-mono text-[12px] text-muted">{topic.code}</span>}
          {topic.title}
        </p>
        {topic.hint && <p className="mt-0.5 text-[12.5px] text-muted">{topic.hint}</p>}
      </div>
    </li>
  );
}

function UnitSection({ unit, exam, open, onToggle, hideMastered }: { unit: Unit; exam: ExamId; open: boolean; onToggle: () => void; hideMastered: boolean }) {
  const topics = useStore((s) => s.topics);
  const setMany = useStore((s) => s.setManyTopics);
  const mastery = unitMastery(unit, topics);
  const mastered = unit.topics.filter((t) => statusOf(topics, t.id) === 'mastered').length;
  const visible = hideMastered ? unit.topics.filter((t) => statusOf(topics, t.id) !== 'mastered') : unit.topics;
  const weight = unit.weight[0] === unit.weight[1] ? `${unit.weight[0]}%` : `${unit.weight[0]}–${unit.weight[1]}%`;

  return (
    <Card className="scroll-mt-24 overflow-hidden">
      <div id={unit.id} className="scroll-mt-24" />
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-sunken/60">
        <span className="num hidden w-10 shrink-0 font-serif text-[22px] font-semibold text-muted sm:block">{isNumberedUnit(unit) ? unit.code : ''}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-serif text-[16.5px] leading-snug font-semibold">
              <span className="sm:hidden">{isNumberedUnit(unit) ? `${unit.code}. ` : ''}</span>
              {unit.title}
            </span>
            {unit.badge && <Badge tone="accent">{unit.badge}</Badge>}
          </span>
          <span className="mt-1.5 flex items-center gap-3">
            <Meter value={mastery} color={`var(--exam-${exam})`} className="max-w-56" label={`${unit.title} mastery`} />
            <span className="num shrink-0 text-[12.5px] text-muted">
              {mastered}/{unit.topics.length}
            </span>
          </span>
        </span>
        <span className="hidden shrink-0 text-right sm:block">
          <span className="block text-[13px] font-semibold">{weight}</span>
          <span className="block text-[11.5px] text-muted">{unit.section ? `of ${unit.section}` : unit.id.startsWith('ielts') ? 'of overall band' : 'of exam'}</span>
        </span>
        <ChevronDown size={18} className={cx('shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="border-t border-line">
          <div className="flex flex-wrap items-center gap-2 bg-sunken/50 px-5 py-2 text-[12.5px] text-muted">
            <span className="sm:hidden">
              {weight} {unit.section ? `of ${unit.section}` : unit.id.startsWith('ielts') ? 'of overall band' : 'of exam'} ·
            </span>
            Set all:
            {STATUS_ORDER.map((s) => (
              <button key={s} type="button" className="rounded-md px-1.5 py-0.5 font-medium text-ink-2 hover:bg-surface hover:text-ink" onClick={() => setMany(unit.topics.map((t) => t.id), s)}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <ul>
            {visible.map((t) => (
              <TopicRow key={t.id} topic={t} exam={exam} />
            ))}
            {visible.length === 0 && <li className="px-5 py-3 text-[13px] text-muted">All topics in this unit are mastered.</li>}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default function Topics() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const exams = useActiveExams();
  const topics = useStore((s) => s.topics);
  const [hideMastered, setHideMastered] = useState(false);
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set());

  const requested = params.exam as ExamId | undefined;
  const exam = requested && exams.includes(requested) ? requested : undefined;
  const course = exam ? COURSES[exam] : undefined;

  // Deep link: /topics/calcbc#calcbc.6 opens and scrolls to that unit.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) return;
    setOpenUnits((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [location.hash, exam]);

  const counts = useMemo(() => (course ? statusCounts(course, topics) : null), [course, topics]);
  if (!exams.length) return <Navigate to="/settings" replace />;
  if (!exam || !course || !counts) return <Navigate to={`/topics/${exams[0]}`} replace />;

  const mastery = courseMastery(course, topics);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const allOpen = course.units.every((u) => openUnits.has(u.id));
  const groups = course.units.some((u) => u.section)
    ? (['Reading & Writing', 'Math'] as const).map((sec) => ({ heading: sec as string, units: course.units.filter((u) => u.section === sec) }))
    : [{ heading: '', units: course.units }];

  return (
    <>
      <PageHeader
        eyebrow="Study"
        title="Topic Tracker"
        description="Every unit and skill from the official College Board frameworks. Click a status to advance it; weights show how much each unit is worth on the exam."
      />

      <Segmented
        label="Exam"
        className="mb-5"
        value={exam}
        onChange={(e) => navigate(`/topics/${e}`)}
        options={exams.map((e) => ({
          value: e,
          label: (
            <>
              <ExamDot exam={e} className="size-2" /> {EXAMS[e].short}
            </>
          ),
        }))}
      />

      <Card className="mb-5 grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-[20px] font-semibold">{course.title}</h2>
            <span className="num font-serif text-[22px] font-semibold">{Math.round(mastery * 100)}%</span>
          </div>
          <Meter value={mastery} color={`var(--exam-${exam})`} className="mt-2 h-2.5" label="Weighted course mastery" />
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted">
            {STATUS_ORDER.map((s) => (
              <span key={s}>
                <span className="num font-semibold text-ink-2">{counts[s]}</span> {STATUS_LABEL[s].toLowerCase()}
              </span>
            ))}
            <span>· {total} topics</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
          <label className="flex items-center gap-2 text-[13px] text-ink-2">
            <input type="checkbox" checked={hideMastered} onChange={(e) => setHideMastered(e.target.checked)} className="accent-[var(--accent)]" />
            Hide mastered topics
          </label>
          <button
            type="button"
            className="text-[13px] font-medium text-accent hover:underline"
            onClick={() => setOpenUnits(allOpen ? new Set() : new Set(course.units.map((u) => u.id)))}
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </Card>

      <details className="mb-6 rounded-xl border border-line bg-surface px-5 py-3 text-[13.5px]">
        <summary className="cursor-pointer font-medium text-ink-2">What the four statuses mean</summary>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {STATUS_ORDER.map((s) => (
            <div key={s}>
              <dt className="font-semibold">{STATUS_LABEL[s]}</dt>
              <dd className="text-muted">{STATUS_HELP[s]}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="flex flex-col gap-8">
        {groups.map((g) => (
          <section key={g.heading || 'all'} className="flex flex-col gap-3">
            {g.heading && <h2 className="eyebrow">{g.heading}</h2>}
            {g.units.map((u) => (
              <UnitSection
                key={u.id}
                unit={u}
                exam={exam}
                hideMastered={hideMastered}
                open={openUnits.has(u.id)}
                onToggle={() =>
                  setOpenUnits((prev) => {
                    const next = new Set(prev);
                    if (next.has(u.id)) next.delete(u.id);
                    else next.add(u.id);
                    return next;
                  })
                }
              />
            ))}
          </section>
        ))}
      </div>

      <p className="mt-8 flex items-center gap-1.5 text-[12.5px] text-muted">
        Source: {course.source}.
        <a href={EXAMS[exam].officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
          Official page <ExternalLink size={12} />
        </a>
      </p>
    </>
  );
}
