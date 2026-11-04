import { ArrowRight, BookOpenCheck, CalendarClock, CheckSquare, ExternalLink, Layers, ListChecks, Timer } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { byPriority, ResourceCard } from '../components/ResourceCard';
import { Badge, buttonClass, Card, cx, Meter, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { IELTS_GUIDE, LINKING_WORDS, SPEAKING_PHRASES, TASK1_STRUCTURE, TASK2_TYPES, WRITING_CHECKLIST } from '../data/ieltsGuide';
import { RESOURCES } from '../data/resources';
import { COURSES } from '../data/topics';
import { daysBetween, formatCountdown, formatDate, todayISO } from '../lib/dates';
import { unitMastery } from '../lib/progress';
import { formatBand } from '../lib/scoring';
import type { IeltsSkill } from '../lib/types';
import { useStore } from '../store/useStore';

const SKILLS: IeltsSkill[] = ['writing', 'speaking', 'listening', 'reading'];
const UNIT_ID: Record<IeltsSkill, string> = { listening: 'ielts.L', reading: 'ielts.R', writing: 'ielts.W', speaking: 'ielts.S' };

function Overview() {
  const cfg = useStore((s) => s.settings.exams.ielts);
  const topics = useStore((s) => s.topics);
  const today = todayISO();
  const days = cfg.date ? daysBetween(today, cfg.date) : null;
  return (
    <Card className="mb-6 grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">IELTS Academic</p>
          <Badge>Target {formatBand(cfg.target)}</Badge>
        </div>
        {days !== null && cfg.date ? (
          <div>
            <p className="font-serif text-[36px] leading-none font-semibold">
              {days > 1 ? days : formatCountdown(days)}
              {days > 1 && <span className="ml-1.5 font-sans text-[15px] font-medium text-muted">days</span>}
            </p>
            <p className="mt-1.5 text-[13px] text-muted">{formatDate(cfg.date, 'long')}</p>
          </div>
        ) : (
          <div>
            <p className="font-serif text-[22px] font-semibold text-ink-2">No test date yet</p>
            <Link to="/settings" className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
              <CalendarClock size={14} /> Add your test date and target
            </Link>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link to="/topics/ielts" className={buttonClass('secondary', 'sm')}>
            <ListChecks size={14} /> Skill tracker
          </Link>
          <Link to="/flashcards" className={buttonClass('secondary', 'sm')}>
            <Layers size={14} /> Flashcards
          </Link>
          <Link to="/scores" className={buttonClass('secondary', 'sm')}>
            <BookOpenCheck size={14} /> Band calculator
          </Link>
          <Link to="/timer?tab=mock" className={buttonClass('secondary', 'sm')}>
            <Timer size={14} /> Mock test timer
          </Link>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {(['listening', 'reading', 'writing', 'speaking'] as IeltsSkill[]).map((skill) => {
          const unit = COURSES.ielts.units.find((u) => u.id === UNIT_ID[skill])!;
          const m = unitMastery(unit, topics);
          const g = IELTS_GUIDE[skill];
          return (
            <li key={skill} className="min-w-0">
              <p className="font-serif text-[16px] font-semibold">{g.title}</p>
              <p className="mt-0.5 text-[12.5px] text-muted">{g.stats.map((s) => s.value).join(' · ')}</p>
              <Meter value={m} color="var(--exam-ielts)" className="mt-2 h-1.5" label={`${g.title} mastery`} />
              <p className="num mt-1 text-[12px] text-muted">{Math.round(m * 100)}% of skills tracked</p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cx('p-5', className)}>
      <h3 className="mb-3 font-serif text-[17px] font-semibold">{title}</h3>
      {children}
    </Card>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[14px] text-ink-2 marker:text-muted">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function WritingExtras() {
  const resources = useMemo(() => new Map(RESOURCES.map((r) => [r.id, r])), []);
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Task 1: report structure">
          <ol className="flex flex-col gap-2.5">
            {TASK1_STRUCTURE.map((s, i) => (
              <li key={s.step} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-[14px]">
                <span className="num font-serif font-semibold text-muted">{i + 1}</span>
                <span>
                  <span className="font-semibold">{s.step}.</span> <span className="text-ink-2">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[12.5px] text-muted">Aim for 170–190 words in about 20 minutes.</p>
        </Section>
        <Section title="Before you hand in">
          <ul className="flex flex-col gap-2 text-[14px] text-ink-2">
            {WRITING_CHECKLIST.map((c) => (
              <li key={c} className="flex gap-2">
                <CheckSquare size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Task 2: the five essay types">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[12.5px] text-muted">
                <th className="py-2 pr-3 font-medium">Type</th>
                <th className="py-2 pr-3 font-medium">The question says…</th>
                <th className="py-2 font-medium">Paragraph plan</th>
              </tr>
            </thead>
            <tbody>
              {TASK2_TYPES.map((t) => (
                <tr key={t.type} className="border-b border-line align-top last:border-b-0">
                  <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">{t.type}</td>
                  <td className="py-2.5 pr-3 text-ink-2 italic">{t.prompt}</td>
                  <td className="py-2.5 text-ink-2">{t.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Linking words by function">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LINKING_WORDS.map((g) => {
            const practice = g.practice ? resources.get(g.practice) : undefined;
            return (
              <div key={g.group} className="flex flex-col gap-2 rounded-xl border border-line p-4">
                <p className="text-[13.5px] font-semibold">{g.group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.words.map((w) => (
                    <span key={w} className="rounded-md bg-sunken px-2 py-0.5 text-[13px] text-ink-2">
                      {w}
                    </span>
                  ))}
                </div>
                {practice && (
                  <a href={practice.url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 pt-1 text-[12.5px] font-medium text-accent hover:underline">
                    Practise with the Testify flashcards <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[12.5px] text-muted">
          Use them where the logic needs them, not at the start of every sentence. All five groups are also in your IELTS flashcard deck.
        </p>
      </Section>
    </>
  );
}

function SpeakingExtras() {
  return (
    <Section title="Useful phrases">
      <div className="grid gap-4 md:grid-cols-2">
        {SPEAKING_PHRASES.map((g) => (
          <div key={g.group} className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[13.5px] font-semibold">{g.group}</p>
            <ul className="flex flex-col gap-1 text-[14px] text-ink-2">
              {g.phrases.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function Ielts() {
  const [params, setParams] = useSearchParams();
  const skillParam = params.get('skill') as IeltsSkill | null;
  const skill: IeltsSkill = skillParam && SKILLS.includes(skillParam) ? skillParam : 'writing';
  const guide = IELTS_GUIDE[skill];
  const resources = useMemo(() => RESOURCES.filter((r) => r.exams.includes('ielts') && r.skills?.includes(skill)).sort(byPriority), [skill]);

  return (
    <>
      <PageHeader
        eyebrow="Study"
        title="IELTS"
        description="Everything for IELTS Academic in one place: the format, how each skill is marked, strategies, useful language, and the best books and courses for each skill."
        actions={
          <a href={EXAMS.ielts.officialUrl} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary')}>
            ielts.org <ExternalLink size={14} />
          </a>
        }
      />

      <Overview />

      <Segmented
        label="Skill"
        className="mb-5"
        value={skill}
        onChange={(s) => setParams({ skill: s })}
        options={SKILLS.map((s) => ({ value: s, label: IELTS_GUIDE[s].title }))}
      />

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Section title={`${guide.title}: format`}>
            <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
              {guide.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[12px] text-muted">{s.label}</p>
                  <p className="font-serif text-[20px] font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
            <Bullets items={guide.format} />
          </Section>
          <Section title="How it’s marked">
            <dl className="flex flex-col gap-3">
              {guide.criteria.map((c) => (
                <div key={c.name}>
                  <dt className="text-[14px] font-semibold">{c.name}</dt>
                  <dd className="mt-0.5 text-[13.5px] text-ink-2">{c.detail}</dd>
                </div>
              ))}
            </dl>
            {guide.criteria.length === 4 && <p className="mt-3 text-[12.5px] text-muted">Each criterion is a quarter of the {guide.title} band.</p>}
          </Section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Strategies">
            <Bullets items={guide.strategies} />
          </Section>
          <Section title="Weekly routine">
            <p className="text-[14px] text-ink-2">{guide.routine}</p>
            <Link to={`/topics/ielts#${UNIT_ID[skill]}`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
              Track {guide.title.toLowerCase()} skills <ArrowRight size={13} />
            </Link>
          </Section>
        </div>

        {skill === 'writing' && <WritingExtras />}
        {skill === 'speaking' && <SpeakingExtras />}

        <section className="mt-4">
          <div className="mb-3">
            <h2 className="font-serif text-[20px] font-semibold">Books & resources for {guide.title}</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {resources.length} picks{resources.some((r) => r.featured) ? ', your courses first' : ''}. Mark what you’re using; it shows on your Library shelf too.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((r) => (
              <ResourceCard key={r.id} r={r} showExams={false} />
            ))}
          </div>
        </section>
      </div>

      <p className="mt-8 text-[12.5px] text-muted">
        IELTS is jointly owned by the British Council, IDP IELTS and Cambridge University Press & Assessment, none of which is affiliated with this site.
      </p>
    </>
  );
}
