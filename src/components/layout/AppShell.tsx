import {
  Calculator,
  CalendarDays,
  Layers,
  LayoutDashboard,
  Library,
  ListChecks,
  Menu,
  NotebookPen,
  Settings,
  Sigma,
  Target,
  Timer,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { EXAMS } from '../../data/exams';
import { formatClock } from '../../lib/dates';
import { useActiveExams, useStudyQueue } from '../../store/selectors';
import { useStore } from '../../store/useStore';
import { mockRemaining, PHASE_LABEL, pomRemaining, useNow, useTimer, useTimerEngine } from '../../store/useTimer';
import { useThemeSync } from '../../store/useThemeSync';
import { cx } from '../ui';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: 'cards';
}

const NAV: { heading: string; items: NavItem[] }[] = [
  { heading: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    heading: 'Study',
    items: [
      { to: '/library', label: 'Library', icon: Library },
      { to: '/topics', label: 'Topic Tracker', icon: ListChecks },
      { to: '/formulas', label: 'Formula Sheets', icon: Sigma },
      { to: '/flashcards', label: 'Flashcards', icon: Layers, badge: 'cards' },
    ],
  },
  {
    heading: 'Practice',
    items: [
      { to: '/practice', label: 'Practice Log', icon: Target },
      { to: '/mistakes', label: 'Mistake Log', icon: NotebookPen },
      { to: '/scores', label: 'Score Estimator', icon: Calculator },
    ],
  },
  {
    heading: 'Plan',
    items: [
      { to: '/planner', label: 'Planner', icon: CalendarDays },
      { to: '/timer', label: 'Timer', icon: Timer },
    ],
  },
];

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-2.5 rounded-lg px-1 py-0.5">
      <svg viewBox="0 0 64 64" className="size-8 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill="var(--accent)" />
        <path
          d="M18 46h28M21 42V24m7.3 18V24m7.4 18V24M43 42V24M16 24l16-9 16 9z"
          stroke="var(--accent-ink)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="leading-none">
        <span className="block font-serif text-[19px] font-semibold tracking-tight">Lyceum</span>
        <span className="mt-0.5 block text-[11px] tracking-wide text-muted">SAT · AP study desk</span>
      </span>
    </NavLink>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const exams = useActiveExams();
  const queue = useStudyQueue(exams);
  const cardCount = queue.due.length + queue.fresh.length;

  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      {NAV.map((group) => (
        <div key={group.heading}>
          <p className="eyebrow mb-1.5 px-3">{group.heading}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map(({ to, label, icon: Icon, badge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cx(
                      'group flex h-9 items-center gap-3 rounded-[10px] px-3 text-[14px] font-medium transition-colors',
                      isActive ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-sunken hover:text-ink',
                    )
                  }
                >
                  <Icon size={17} strokeWidth={1.9} className="shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {badge === 'cards' && cardCount > 0 && (
                    <span className="num rounded-full bg-sunken px-1.5 text-[11.5px] font-semibold text-ink-2">{cardCount}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cx(
              'flex h-9 items-center gap-3 rounded-[10px] px-3 text-[14px] font-medium transition-colors',
              isActive ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-sunken hover:text-ink',
            )
          }
        >
          <Settings size={17} strokeWidth={1.9} />
          Settings
        </NavLink>
      </div>
    </nav>
  );
}

/** Live chip shown whenever a Pomodoro or mock exam is running. */
function RunningTimer({ compact = false }: { compact?: boolean }) {
  const pom = useTimer((s) => s.pom);
  const mock = useTimer((s) => s.mock);
  const now = useNow(500);
  const items: ReactNode[] = [];
  if (pom.running) {
    items.push(
      <NavLink key="pom" to="/timer" className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] hover:bg-sunken">
        <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden />
        <span className="num font-mono font-medium">{formatClock(pomRemaining(pom, now))}</span>
        {!compact && <span className="truncate text-muted">{PHASE_LABEL[pom.phase]}</span>}
      </NavLink>,
    );
  }
  if (mock.running && mock.exam) {
    items.push(
      <NavLink key="mock" to="/timer?tab=mock" className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] hover:bg-sunken">
        <span className="size-2 animate-pulse rounded-full" style={{ background: `var(--exam-${mock.exam})` }} aria-hidden />
        <span className="num font-mono font-medium">{formatClock(mockRemaining(mock, now))}</span>
        {!compact && <span className="truncate text-muted">{EXAMS[mock.exam].short} mock</span>}
      </NavLink>,
    );
  }
  if (!items.length) return null;
  return <div className={cx('flex gap-2', compact ? 'flex-row' : 'flex-col')}>{items}</div>;
}

/** Keeps the tab title informative while a timer runs. */
function useDocumentTitle() {
  const pom = useTimer((s) => s.pom);
  const mock = useTimer((s) => s.mock);
  const now = useNow(1000);
  useEffect(() => {
    if (mock.running && mock.exam) document.title = `${formatClock(mockRemaining(mock, now))} · ${EXAMS[mock.exam].short} mock — Lyceum`;
    else if (pom.running) document.title = `${formatClock(pomRemaining(pom, now))} · ${PHASE_LABEL[pom.phase]} — Lyceum`;
    else document.title = 'Lyceum Study Desk';
  }, [pom, mock, now]);
}

export function AppShell() {
  useTimerEngine();
  useThemeSync();
  useDocumentTitle();
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const name = useStore((s) => s.settings.name);

  // Scroll to top on navigation; close the drawer.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setDrawer(false);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_minmax(0,1fr)] print:block">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col print:hidden gap-6 overflow-y-auto border-r border-line bg-paper px-4 py-5 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto flex flex-col gap-3">
          <RunningTimer />
          <div className="flex items-center justify-between px-1">
            <span className="truncate text-[12.5px] text-muted">{name ? `${name}’s desk · saved locally` : 'Saved in this browser'}</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-paper/90 px-4 py-2.5 backdrop-blur lg:hidden print:hidden">
        <Brand />
        <div className="flex items-center gap-1.5">
          <RunningTimer compact />
          <ThemeToggle />
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-sunken"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/35" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(300px,85vw)] flex-col gap-5 overflow-y-auto border-l border-line bg-paper px-4 py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-sunken"
              >
                <X size={20} />
              </button>
            </div>
            <NavList onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <main id="main" className="mx-auto w-full max-w-[1180px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
