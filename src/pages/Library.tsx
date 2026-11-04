import { BookOpen, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { byPriority, COST_LABEL, KIND_LABEL, ResourceCard } from '../components/ResourceCard';
import { Button, Card, EmptyState, Field, Modal, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { RESOURCES } from '../data/resources';
import type { ExamId, ResourceCost, ResourceKind, ResourcePriority } from '../lib/types';
import { useActiveExams } from '../store/selectors';
import { useStore } from '../store/useStore';

function AddResource({ open, onClose, exams }: { open: boolean; onClose: () => void; exams: ExamId[] }) {
  const add = useStore((s) => s.addResource);
  const [form, setForm] = useState({ title: '', author: '', url: '', kind: 'book' as ResourceKind, cost: 'free' as ResourceCost, exam: exams[0] ?? 'sat', description: '', howToUse: '' });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    if (!form.title.trim()) return;
    add({
      title: form.title.trim(),
      author: form.author.trim() || '—',
      url: form.url.trim(),
      kind: form.kind,
      cost: form.cost,
      exams: [form.exam],
      priority: 'recommended',
      description: form.description.trim(),
      howToUse: form.howToUse.trim(),
    });
    setForm((f) => ({ ...f, title: '', author: '', url: '', description: '', howToUse: '' }));
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a resource"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!form.title.trim()}>
            Add to library
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2">
          {(id) => <input id={id} className="field" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. My teacher’s Unit 10 packet" />}
        </Field>
        <Field label="Author / source">{(id) => <input id={id} className="field" value={form.author} onChange={(e) => set('author', e.target.value)} />}</Field>
        <Field label="Link (optional)">{(id) => <input id={id} className="field" type="url" value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://…" />}</Field>
        <Field label="Exam">
          {(id) => (
            <select id={id} className="field" value={form.exam} onChange={(e) => set('exam', e.target.value as ExamId)}>
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
            <select id={id} className="field" value={form.kind} onChange={(e) => set('kind', e.target.value as ResourceKind)}>
              {(Object.keys(KIND_LABEL) as ResourceKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Cost">
          {(id) => (
            <select id={id} className="field" value={form.cost} onChange={(e) => set('cost', e.target.value as ResourceCost)}>
              {(Object.keys(COST_LABEL) as ResourceCost[]).map((k) => (
                <option key={k} value={k}>
                  {COST_LABEL[k]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Description" className="sm:col-span-2">
          {(id) => <textarea id={id} rows={2} className="field" value={form.description} onChange={(e) => set('description', e.target.value)} />}
        </Field>
        <Field label="How you’ll use it" className="sm:col-span-2">
          {(id) => <textarea id={id} rows={2} className="field" value={form.howToUse} onChange={(e) => set('howToUse', e.target.value)} />}
        </Field>
      </div>
    </Modal>
  );
}

export default function LibraryPage() {
  const activeExams = useActiveExams();
  const custom = useStore((s) => s.customResources);
  const statuses = useStore((s) => s.resourceStatus);
  const [exam, setExam] = useState<ExamId | 'all'>('all');
  const [kind, setKind] = useState<ResourceKind | 'all'>('all');
  const [cost, setCost] = useState<'all' | 'free'>('all');
  const [priority, setPriority] = useState<ResourcePriority | 'all'>('all');
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);

  const all = useMemo(() => [...custom, ...RESOURCES], [custom]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter((r) => r.exams.some((e) => activeExams.includes(e)))
      .filter((r) => exam === 'all' || r.exams.includes(exam))
      .filter((r) => kind === 'all' || r.kind === kind)
      .filter((r) => cost === 'all' || r.cost === 'free' || r.cost === 'freemium')
      .filter((r) => priority === 'all' || r.priority === priority)
      .filter((r) => !mine || (statuses[r.id] ?? 'none') !== 'none')
      .filter((r) => !needle || `${r.title} ${r.author} ${r.description} ${r.howToUse}`.toLowerCase().includes(needle))
      .sort(byPriority);
  }, [all, activeExams, exam, kind, cost, priority, mine, statuses, q]);

  const using = Object.values(statuses).filter((s) => s === 'using').length;
  const done = Object.values(statuses).filter((s) => s === 'done').length;

  return (
    <>
      <PageHeader
        eyebrow="Study"
        title="Library"
        description={
          <>
            The strongest books, official sources and free courses — each with a note on <em>how</em> to use it. Official College Board material comes
            first: it is the closest thing to the real exam.
          </>
        }
        actions={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Add resource
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3">
        <Segmented
          label="Filter by exam"
          value={exam}
          onChange={setExam}
          options={[{ value: 'all' as const, label: 'All' }, ...activeExams.map((e) => ({ value: e, label: EXAMS[e].short }))]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 basis-56">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
            <input className="field pl-9" placeholder="Search titles, authors, tips…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search library" />
          </label>
          <select className="field w-auto" value={kind} onChange={(e) => setKind(e.target.value as ResourceKind | 'all')} aria-label="Type">
            <option value="all">All types</option>
            {(Object.keys(KIND_LABEL) as ResourceKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <select className="field w-auto" value={priority} onChange={(e) => setPriority(e.target.value as ResourcePriority | 'all')} aria-label="Priority">
            <option value="all">Any priority</option>
            <option value="essential">Essential</option>
            <option value="recommended">Recommended</option>
            <option value="supplementary">Extra</option>
          </select>
          <select className="field w-auto" value={cost} onChange={(e) => setCost(e.target.value as 'all' | 'free')} aria-label="Cost">
            <option value="all">Free & paid</option>
            <option value="free">Free only</option>
          </select>
          <label className="flex h-9.5 items-center gap-2 rounded-[10px] border border-line-strong bg-surface px-3 text-[13px]">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="accent-[var(--accent)]" />
            My shelf
          </label>
        </div>
        <p className="text-[13px] text-muted">
          {list.length} resources · {using} in use · {done} finished
        </p>
      </div>

      {list.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <ResourceCard key={r.id} r={r} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={<BookOpen size={28} />} title="Nothing matches these filters">
            Try clearing the search or switching off “My shelf”.
          </EmptyState>
        </Card>
      )}

      <AddResource open={adding} onClose={() => setAdding(false)} exams={activeExams.length ? activeExams : ['sat']} />
    </>
  );
}
