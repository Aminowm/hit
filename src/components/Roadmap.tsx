import { daysBetween, formatDate } from '../lib/dates';
import type { Phase } from '../lib/roadmap';
import { Badge, cx } from './ui';

/** Vertical timeline of study phases; the current phase shows its action list. */
export function RoadmapTimeline({ phases, today, expandAll = false }: { phases: Phase[]; today: string; expandAll?: boolean }) {
  if (!phases.length) return <p className="text-sm text-muted">Add exam dates in Settings to generate a plan.</p>;
  return (
    <ol className="relative border-l border-line">
      {phases.map((p) => {
        const active = p.start <= today && today <= p.end;
        const past = p.end < today;
        return (
          <li key={p.id} className="relative pb-5 pl-5 last:pb-0">
            <span
              aria-hidden
              className={cx(
                'absolute top-1.5 -left-[5px] size-[9px] rounded-full border-2',
                active ? 'border-accent bg-accent' : past ? 'border-line-strong bg-line-strong' : 'border-line-strong bg-surface',
              )}
            />
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h3 className={cx('font-serif text-[16px] font-semibold', past && 'text-muted')}>{p.title}</h3>
              <span className="text-[12.5px] text-muted">
                {formatDate(p.start, 'short')} – {formatDate(p.end, 'short')} · {daysBetween(p.start, p.end) + 1} days
              </span>
              {active && <Badge tone="accent">Now</Badge>}
            </div>
            <p className="mt-1 text-[13.5px] text-ink-2">{p.focus}</p>
            {(active || expandAll) && (
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-[13px] text-ink-2 marker:text-muted">
                {p.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
