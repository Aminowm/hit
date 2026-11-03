import katex from 'katex';
import { Fragment, memo, useMemo, type ReactNode } from 'react';

function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' });
}

/** A single KaTeX expression. MathML output keeps it readable by screen readers. */
export const Tex = memo(function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => render(tex, display), [tex, display]);
  const Tag = display ? 'div' : 'span';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

/** Inline markdown-lite: **bold**, _italic_. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    out.push(
      tok.startsWith('**') ? (
        <strong key={`${keyBase}-${i++}`} className="font-semibold text-ink">
          {tok.slice(2, -2)}
        </strong>
      ) : (
        <em key={`${keyBase}-${i++}`} className="font-sans text-[0.68em] font-medium tracking-wide text-muted not-italic">
          {tok.slice(1, -1)}
        </em>
      ),
    );
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Renders user/card text with `$$display$$` and `$inline$` math, **bold**, _muted_
 * and line breaks. Used for flashcards, notes and hints.
 */
export const RichText = memo(function RichText({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => {
    const nodes: ReactNode[] = [];
    const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    const pushText = (t: string) => {
      t.split('\n').forEach((line, li, arr) => {
        nodes.push(<Fragment key={`t${k++}`}>{inline(line, `i${k}`)}</Fragment>);
        if (li < arr.length - 1) nodes.push(<br key={`br${k++}`} />);
      });
    };
    while ((m = re.exec(text))) {
      if (m.index > last) pushText(text.slice(last, m.index));
      if (m[1] !== undefined) nodes.push(<Tex key={`d${k++}`} tex={m[1]} display />);
      else nodes.push(<Tex key={`m${k++}`} tex={m[2]} />);
      last = m.index + m[0].length;
    }
    if (last < text.length) pushText(text.slice(last));
    return nodes;
  }, [text]);
  return <div className={className}>{parts}</div>;
});
