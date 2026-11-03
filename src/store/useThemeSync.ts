import { useEffect } from 'react';
import { useStore } from './useStore';

/**
 * Applies the theme preference to <html data-theme>. "System" follows the host page's
 * theme when embedded, otherwise the OS setting.
 */
export function useThemeSync() {
  const pref = useStore((s) => s.settings.theme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const host = (window as Window & { __lyceumHostTheme?: 'light' | 'dark' | null }).__lyceumHostTheme;
    const apply = () => {
      const systemDark = host ? host === 'dark' : mq.matches;
      const dark = pref === 'dark' || (pref === 'system' && systemDark);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    if (pref !== 'system') return;
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [pref]);
}
