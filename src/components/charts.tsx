import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { daysBetween, formatDate } from '../lib/dates';
import { cx } from './ui';

/**
 * Small hand-rolled SVG charts following one visual system:
 * 2px lines, ≥8px markers with a 2px surface ring, hairline solid gridlines,
 * bars ≤24px with a 4px rounded data-end, 2px surface gaps between stacked
 * segments, a legend for ≥2 series, and a hover/focus tooltip on every mark.
 */

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    setW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

export function Legend({ items, mark = 'line' }: { items: { label: string; color: string }[]; mark?: 'line' | 'rect' }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-2">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          {mark === 'line' ? (
            <span aria-hidden className="h-0.5 w-3.5 rounded-full" style={{ background: i.color }} />
          ) : (
            <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: i.color }} />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  );
}

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = Math.min(Math.max(x, 70), width - 70);
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 min-w-[120px] -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12.5px] shadow-lg"
      style={{ left, top: y - 10 }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- line chart

export interface LineSeries {
  id: string;
  label: string;
  color: string;
  points: { date: string; value: number }[];
}

export function LineChart({
  series,
  domain,
  height = 220,
  target,
  format = (v) => String(Math.round(v)),
  ariaLabel,
}: {
  series: LineSeries[];
  domain: [number, number];
  height?: number;
  target?: { value: number; label: string };
  format?: (v: number) => string;
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);

  const dates = useMemo(() => [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].sort(), [series]);
  const pad = { top: 14, right: 64, bottom: 26, left: 44 };
  const innerW = Math.max(10, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const first = dates[0];
  const spanDays = first ? Math.max(1, daysBetween(first, dates[dates.length - 1])) : 1;
  const xOf = (d: string) => pad.left + (dates.length === 1 ? innerW / 2 : (daysBetween(first, d) / spanDays) * innerW);
  const yOf = (v: number) => pad.top + innerH - ((v - domain[0]) / (domain[1] - domain[0])) * innerH;
  const ticks = niceTicks(domain[0], domain[1]);
  const xLabels = dates.length <= 1 ? dates : [dates[0], dates[dates.length - 1]];

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best: string | null = null;
    let bestD = Infinity;
    for (const d of dates) {
      const dist = Math.abs(xOf(d) - x);
      if (dist < bestD) {
        bestD = dist;
        best = d;
      }
    }
    setHover(best);
  };

  const hoverRows = hover
    ? series.flatMap((s) => s.points.filter((p) => p.date === hover).map((p) => ({ s, p })))
    : [];

  return (
    <div className="flex flex-col gap-3">
      {series.length > 1 && <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />}
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            className="block touch-none select-none"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={pad.left + innerW} y1={yOf(t)} y2={yOf(t)} stroke="var(--grid)" strokeWidth={1} />
                <text x={pad.left - 8} y={yOf(t)} dy="0.32em" textAnchor="end" className="num fill-muted text-[11px]">
                  {format(t)}
                </text>
              </g>
            ))}
            {xLabels.map((d, i) => (
              <text
                key={d}
                x={xOf(d)}
                y={height - 6}
                textAnchor={xLabels.length === 1 ? 'middle' : i === 0 ? 'start' : 'end'}
                className="fill-muted text-[11px]"
              >
                {formatDate(d, 'short')}
              </text>
            ))}
            {target && target.value >= domain[0] && target.value <= domain[1] && (
              <g>
                <line x1={pad.left} x2={pad.left + innerW} y1={yOf(target.value)} y2={yOf(target.value)} stroke="var(--ink-2)" strokeWidth={1} opacity={0.55} />
                <text x={pad.left + innerW + 6} y={yOf(target.value)} dy="0.32em" className="fill-ink-2 text-[11px] font-medium">
                  {target.label}
                </text>
              </g>
            )}
            {hover && <line x1={xOf(hover)} x2={xOf(hover)} y1={pad.top} y2={pad.top + innerH} stroke="var(--axis)" strokeWidth={1} />}
            {series.map((s) => {
              const pts = [...s.points].sort((a, b) => a.date.localeCompare(b.date));
              const d = pts.map((p, i) => `${i ? 'L' : 'M'}${xOf(p.date)},${yOf(p.value)}`).join('');
              const last = pts[pts.length - 1];
              return (
                <g key={s.id}>
                  {pts.length > 1 && <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
                  {pts.map((p) => (
                    <circle
                      key={p.date + p.value}
                      cx={xOf(p.date)}
                      cy={yOf(p.value)}
                      r={hover === p.date ? 5.5 : 4}
                      fill={s.color}
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                  ))}
                  {last && (
                    <text x={xOf(last.date) + 9} y={yOf(last.value)} dy="0.32em" className="num fill-ink text-[11.5px] font-semibold">
                      {format(last.value)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
        {hover && hoverRows.length > 0 && (
          <Tooltip x={xOf(hover)} y={Math.min(...hoverRows.map((r) => yOf(r.p.value)))} width={width}>
            <p className="mb-0.5 text-[11.5px] text-muted">{formatDate(hover)}</p>
            {hoverRows.map(({ s, p }, i) => (
              <p key={s.id + i} className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
                <span className="num font-semibold text-ink">{format(p.value)}</span>
                <span className="text-muted">{s.label}</span>
              </p>
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- stacked columns

export interface StackKey {
  id: string;
  label: string;
  color: string;
}

export function StackedColumns({
  data,
  keys,
  height = 180,
  goal,
  format = (v) => String(Math.round(v)),
  ariaLabel,
}: {
  data: { label: string; sublabel?: string; values: Record<string, number | undefined> }[];
  keys: StackKey[];
  height?: number;
  goal?: { value: number; label: string };
  format?: (v: number) => string;
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { top: 12, right: goal ? 44 : 8, bottom: 34, left: 36 };
  const innerW = Math.max(10, width - pad.left - pad.right);
  const innerH = height - pad.top - pad.bottom;
  const totals = data.map((d) => keys.reduce((s, k) => s + (d.values[k.id] ?? 0), 0));
  const max = Math.max(goal?.value ?? 0, ...totals, 1) * 1.08;
  const ticks = niceTicks(0, max, 3);
  const yMax = Math.max(max, ticks[ticks.length - 1] ?? max);
  const yOf = (v: number) => pad.top + innerH - (v / yMax) * innerH;
  const band = innerW / Math.max(1, data.length);
  const barW = Math.min(24, band * 0.6);
  const GAP = 2;

  const usedKeys = keys.filter((k) => data.some((d) => (d.values[k.id] ?? 0) > 0));

  return (
    <div className="flex flex-col gap-3">
      {usedKeys.length > 1 && <Legend items={usedKeys} mark="rect" />}
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block select-none" onPointerLeave={() => setHover(null)}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={pad.left + innerW} y1={yOf(t)} y2={yOf(t)} stroke={t === 0 ? 'var(--axis)' : 'var(--grid)'} strokeWidth={1} />
                <text x={pad.left - 8} y={yOf(t)} dy="0.32em" textAnchor="end" className="num fill-muted text-[11px]">
                  {format(t)}
                </text>
              </g>
            ))}
            {goal && (
              <g>
                <line x1={pad.left} x2={pad.left + innerW} y1={yOf(goal.value)} y2={yOf(goal.value)} stroke="var(--ink-2)" strokeWidth={1} opacity={0.55} />
                <text x={pad.left + innerW + 6} y={yOf(goal.value)} dy="0.32em" className="fill-ink-2 text-[11px] font-medium">
                  {goal.label}
                </text>
              </g>
            )}
            {data.map((d, col) => {
              const cx0 = pad.left + band * col + band / 2;
              let acc = 0;
              const segs = usedKeys
                .map((k) => ({ k, v: d.values[k.id] ?? 0 }))
                .filter((s) => s.v > 0);
              return (
                <g key={d.label + col}>
                  {segs.map(({ k, v }, i) => {
                    const y0 = yOf(acc);
                    acc += v;
                    const y1 = yOf(acc);
                    const isTop = i === segs.length - 1;
                    const h = Math.max(1, y0 - y1 - (i > 0 ? GAP : 0));
                    const y = y1;
                    const r = isTop ? Math.min(4, h) : 0;
                    const x = cx0 - barW / 2;
                    // Rounded top only (data-end); square at the baseline.
                    const path = `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + h} Z`;
                    return <path key={k.id} d={path} fill={k.color} opacity={hover !== null && hover !== col ? 0.5 : 1} />;
                  })}
                  {/* Hit target = the whole column band, so short bars are easy to hover. */}
                  <rect
                    x={pad.left + band * col}
                    y={pad.top}
                    width={band}
                    height={innerH}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${d.label}: ${segs.map((sg) => `${sg.k.label} ${format(sg.v)}`).join(', ') || 'nothing logged'}`}
                    onPointerEnter={() => setHover(col)}
                    onFocus={() => setHover(col)}
                    onBlur={() => setHover(null)}
                    className="outline-none"
                  />
                  <text x={cx0} y={height - 18} textAnchor="middle" className="fill-muted text-[11px]">
                    {d.label}
                  </text>
                  {d.sublabel && (
                    <text x={cx0} y={height - 5} textAnchor="middle" className="num fill-muted text-[10.5px]">
                      {d.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
        {hover !== null && width > 0 && (() => {
          const d = data[hover];
          const cx0 = pad.left + band * hover + band / 2;
          const rows = usedKeys.filter((k) => (d.values[k.id] ?? 0) > 0);
          return (
            <Tooltip x={cx0} y={yOf(totals[hover])} width={width}>
              <p className="mb-0.5 text-[11.5px] text-muted">{d.label}</p>
              {rows.map((k) => (
                <p key={k.id} className="flex items-center gap-2">
                  <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: k.color }} />
                  <span className="num font-semibold text-ink">{format(d.values[k.id] ?? 0)}</span>
                  <span className="text-muted">{k.label}</span>
                </p>
              ))}
              <p className={rows.length ? 'mt-0.5 text-[11.5px] text-muted' : 'text-[12.5px] text-ink-2'}>
                {rows.length ? `Total ${format(totals[hover])}` : 'Nothing logged'}
              </p>
            </Tooltip>
          );
        })()}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- horizontal bars (single series)

export function BarList({
  rows,
  color = 'var(--accent)',
  format = (v) => String(v),
  className,
}: {
  rows: { label: string; value: number; hint?: string }[];
  color?: string;
  format?: (v: number) => string;
  className?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className={cx('flex flex-col gap-2.5', className)}>
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-[13px]" title={r.hint}>
          <span className="truncate text-ink-2">{r.label}</span>
          <span className="relative h-3 rounded-r-[4px]">
            <span
              className="absolute inset-y-0 left-0 rounded-r-[4px] transition-[width] duration-500"
              style={{ width: `${(r.value / max) * 100}%`, background: color, minWidth: r.value ? 3 : 0 }}
            />
          </span>
          <span className="num w-7 text-right font-semibold">{format(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}
