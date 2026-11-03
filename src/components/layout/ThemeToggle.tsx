import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePref } from '../../lib/types';
import { useStore } from '../../store/useStore';

const NEXT: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' };
const LABEL: Record<ThemePref, string> = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' };

export function ThemeToggle() {
  const theme = useStore((s) => s.settings.theme);
  const update = useStore((s) => s.updateSettings);
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={() => update({ theme: NEXT[theme] })}
      aria-label={`${LABEL[theme]} (click to change)`}
      title={LABEL[theme]}
      className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
    >
      <Icon size={18} strokeWidth={1.9} />
    </button>
  );
}
