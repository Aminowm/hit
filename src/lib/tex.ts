/**
 * Formulas that list several relations separated by `\qquad` are stacked one per
 * line, so they stay readable on narrow cards and phones instead of overflowing.
 */
export function stackTex(tex: string): string {
  if (!tex.includes('\\qquad')) return tex;
  const parts = tex.split('\\qquad').map((p) => p.trim());
  return `\\begin{gathered}${parts.join(' \\\\ ')}\\end{gathered}`;
}
