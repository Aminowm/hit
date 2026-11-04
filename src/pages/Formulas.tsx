import { Check, Copy, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Tex } from '../components/Tex';
import { Badge, Button, Card, EmptyState, ExamDot, IconButton, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { FORMULAS } from '../data/formulas';
import { isFramed } from '../lib/env';
import { stackTex } from '../lib/tex';
import type { ExamId, Formula } from '../lib/types';
import { useActiveExams } from '../store/selectors';

const SHEET_NOTE: Record<ExamId, string> = {
  sat: 'Bluebook gives you a reference sheet with the geometry formulas marked “on sheet”. Everything else you must know cold.',
  calcbc: 'AP Calculus has NO formula sheet. Every formula here must be memorized — flashcards are generated for all of them.',
  phys1: 'You get the official equation sheet for the whole exam. Learn what each symbol means and when each equation applies.',
  ielts: 'IELTS has no formulas. Useful language lives on the IELTS page and in Flashcards.',
  physc: 'The equation sheet covers the core relations; the calculus-based results marked “memorize” are faster to know than to derive.',
};

function FormulaCard({ f }: { f: Formula }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(f.tex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <Card as="article" className="flex flex-col break-inside-avoid p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] leading-snug font-semibold">{f.name}</h3>
        <div className="flex shrink-0 items-center gap-1">
          {f.provided ? <Badge tone="neutral">On sheet</Badge> : <Badge tone="accent">Memorize</Badge>}
          <IconButton label={copied ? 'Copied' : 'Copy LaTeX'} onClick={copy} className="print:hidden">
            {copied ? <Check size={15} className="text-good" /> : <Copy size={15} />}
          </IconButton>
        </div>
      </div>
      <div className="my-2 overflow-x-auto text-ink">
        <Tex tex={stackTex(f.tex)} display />
      </div>
      {f.note && <p className="mt-auto text-[12.5px] text-muted">{f.note}</p>}
    </Card>
  );
}

export default function Formulas() {
  const active = useActiveExams();
  const exams = active.filter((e) => FORMULAS[e].length > 0);
  const [exam, setExam] = useState<ExamId>(exams.includes('calcbc') ? 'calcbc' : (exams[0] ?? 'sat'));
  const [q, setQ] = useState('');
  const [memorizeOnly, setMemorizeOnly] = useState(false);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = FORMULAS[exam].filter(
      (f) => (!memorizeOnly || !f.provided) && (!needle || `${f.name} ${f.group} ${f.note ?? ''} ${f.tex}`.toLowerCase().includes(needle)),
    );
    const map = new Map<string, Formula[]>();
    for (const f of list) map.set(f.group, [...(map.get(f.group) ?? []), f]);
    return [...map.entries()];
  }, [exam, q, memorizeOnly]);

  const count = groups.reduce((s, [, l]) => s + l.length, 0);
  const toMemorize = FORMULAS[exam].filter((f) => !f.provided).length;

  return (
    <>
      <PageHeader
        eyebrow="Study"
        title="Formula Sheets"
        description="Rendered with real math typesetting. Each formula is marked as either on the official reference sheet or one you must memorize."
        actions={
          isFramed ? undefined : (
            <Button onClick={() => window.print()} className="print:hidden">
              <Printer size={16} /> Print sheet
            </Button>
          )
        }
      />

      <div className="mb-5 flex flex-col gap-3 print:hidden">
        <Segmented
          label="Exam"
          value={exam}
          onChange={setExam}
          options={exams.map((e) => ({
            value: e,
            label: (
              <>
                <ExamDot exam={e} className="size-2" /> {EXAMS[e].short}
              </>
            ),
          }))}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 basis-56">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
            <input className="field pl-9" placeholder="Search formulas (e.g. “series”, “torque”)…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search formulas" />
          </label>
          <label className="flex h-9.5 items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3 text-[13px]">
            <input type="checkbox" checked={memorizeOnly} onChange={(e) => setMemorizeOnly(e.target.checked)} className="accent-[var(--accent)]" />
            Must-memorize only
          </label>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-line bg-accent-soft/50 px-4 py-3 text-[13.5px] text-ink-2">
        <span className="font-semibold text-ink">{EXAMS[exam].name}: </span>
        {SHEET_NOTE[exam]} <span className="text-muted">({toMemorize} to memorize.)</span>
      </div>

      {count === 0 ? (
        <Card>
          <EmptyState title="No formulas match">Try a different search term.</EmptyState>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([group, list]) => (
            <section key={group}>
              <h2 className="mb-3 font-serif text-[19px] font-semibold">{group}</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {list.map((f) => (
                  <FormulaCard key={f.id} f={f} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="mt-8 text-[12.5px] text-muted">
        Always practise with the latest official reference/equation sheet from College Board — sheets are occasionally revised.
      </p>
    </>
  );
}
