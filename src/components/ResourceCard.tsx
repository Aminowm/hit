import { ExternalLink, Lightbulb, Trash2 } from 'lucide-react';
import type { IeltsSkill, Resource, ResourceCost, ResourceKind, ResourcePriority, ResourceStatus } from '../lib/types';
import { useStore } from '../store/useStore';
import { askConfirm } from './confirm';
import { Badge, buttonClass, Card, cx, ExamTag, IconButton } from './ui';

export const KIND_LABEL: Record<ResourceKind, string> = {
  official: 'Official',
  book: 'Prep book',
  textbook: 'Textbook',
  course: 'Online course',
  flashcards: 'Flashcards',
  video: 'Video',
  website: 'Website',
  practice: 'Question bank',
  tool: 'Tool',
};

export const PRIORITY: Record<ResourcePriority, { label: string; tone: 'accent' | 'neutral' | 'good' }> = {
  essential: { label: 'Essential', tone: 'accent' },
  recommended: { label: 'Recommended', tone: 'good' },
  supplementary: { label: 'Extra', tone: 'neutral' },
};

export const COST_LABEL: Record<ResourceCost, string> = { free: 'Free', paid: 'Paid', freemium: 'Free + paid' };

export const STATUS_LABEL: Record<ResourceStatus, string> = { none: 'Not tracked', planned: 'Planned', using: 'Using now', done: 'Finished' };

export const PRIORITY_RANK: Record<ResourcePriority, number> = { essential: 0, recommended: 1, supplementary: 2 };

export const SKILL_LABEL: Record<IeltsSkill, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };

/** Featured first, then by priority. */
export const byPriority = (a: Resource, b: Resource) =>
  Number(!!b.featured) - Number(!!a.featured) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];

export function ResourceCard({ r, showExams = true }: { r: Resource; showExams?: boolean }) {
  const status = useStore((s) => s.resourceStatus[r.id] ?? 'none');
  const setStatus = useStore((s) => s.setResourceStatus);
  const remove = useStore((s) => s.removeResource);
  const p = PRIORITY[r.priority];

  return (
    <Card as="article" className={cx('flex flex-col p-5', status === 'done' && 'opacity-75', r.featured && 'border-accent/40')}>
      <div className="flex flex-wrap items-center gap-1.5">
        {r.featured && <Badge tone="accent">Your pick</Badge>}
        <Badge tone={p.tone}>{p.label}</Badge>
        <Badge>{KIND_LABEL[r.kind]}</Badge>
        {r.cost && <Badge tone={r.cost === 'free' ? 'good' : 'neutral'}>{COST_LABEL[r.cost]}</Badge>}
        {r.custom && <Badge tone="warn">Yours</Badge>}
      </div>
      <h3 className="mt-3 font-serif text-[17px] leading-snug font-semibold">{r.title}</h3>
      <p className="mt-0.5 text-[13px] text-muted">{r.author}</p>
      <p className="mt-2.5 text-[14px] text-ink-2">{r.description}</p>
      {r.howToUse && (
        <div className="mt-3 flex gap-2 rounded-lg bg-sunken px-3 py-2.5 text-[13px] text-ink-2">
          <Lightbulb size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <p>
            <span className="font-semibold text-ink">How to use it: </span>
            {r.howToUse}
          </p>
        </div>
      )}
      {(showExams || r.skills) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {showExams && r.exams.map((e) => <ExamTag key={e} exam={e} />)}
          {r.skills && r.skills.length < 4 && r.skills.map((s) => <Badge key={s}>{SKILL_LABEL[s]}</Badge>)}
        </div>
      )}
      <div className="min-h-4 flex-1" aria-hidden />
      <div className="flex items-center gap-2 border-t border-line pt-4">
        <select
          aria-label={`Status of ${r.title}`}
          className="field h-8 w-auto py-0 text-[13px]"
          value={status}
          onChange={(e) => setStatus(r.id, e.target.value as ResourceStatus)}
        >
          {(Object.keys(STATUS_LABEL) as ResourceStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="flex-1" />
        {r.custom && (
          <IconButton label="Remove resource" onClick={async () => (await askConfirm({ title: `Remove “${r.title}”?`, confirmLabel: 'Remove', danger: true })) && remove(r.id)}>
            <Trash2 size={16} />
          </IconButton>
        )}
        {r.url && (
          <a href={r.url} target="_blank" rel="noopener noreferrer" className={buttonClass('secondary', 'sm')}>
            Open <ExternalLink size={14} />
          </a>
        )}
      </div>
    </Card>
  );
}
