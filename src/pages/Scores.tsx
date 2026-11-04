import { Info, Save } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CardHeader, cx, ExamDot, Field, PageHeader, Segmented } from '../components/ui';
import { EXAMS } from '../data/exams';
import { todayISO } from '../lib/dates';
import {
  AP_FORMATS,
  apCompositePercent,
  apFrqPointsNeeded,
  apScoreFromPercent,
  estimateSat,
  formatBand,
  ieltsBandFromRaw,
  ieltsOverall,
  ieltsRawNeeded,
  SAT_MATH_MAX,
  SAT_RW_MAX,
  satTargetSplits,
  type SatRoute,
} from '../lib/scoring';
import type { ExamId } from '../lib/types';
import { useActiveExams } from '../store/selectors';
import { useStore } from '../store/useStore';

function NumberInput({ value, onChange, max, id, label }: { value: number; onChange: (n: number) => void; max: number; id?: string; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="min-w-0 flex-1 accent-[var(--accent)]"
        aria-label={label ? `${label} slider` : undefined}
      />
      <input
        id={id}
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
        className="field num w-20 text-right"
        aria-label={label}
      />
      <span className="num w-10 text-[13px] text-muted">/ {max}</span>
    </div>
  );
}

function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg bg-sunken px-3 py-2.5 text-[12.5px] text-ink-2">
      <Info size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function SatEstimator() {
  const savedTarget = useStore((s) => s.settings.exams.sat.target);
  const addPractice = useStore((s) => s.addPractice);
  const [rw, setRw] = useState(50);
  const [math, setMath] = useState(41);
  const [rwRoute, setRwRoute] = useState<SatRoute>('harder');
  const [mathRoute, setMathRoute] = useState<SatRoute>('harder');
  const [target, setTarget] = useState(savedTarget);
  const [saved, setSaved] = useState(false);
  const est = estimateSat(rw, math, rwRoute, mathRoute);
  const delta = est.total - target;
  const splits = satTargetSplits(target).filter((s) => s.rwMisses >= 0 && s.mathMisses >= 0);
  const balanced = splits
    .map((s) => ({ ...s, d: Math.abs(s.rw - s.math) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5)
    .sort((a, b) => a.rw - b.rw);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader title="Raw score → scaled estimate" subtitle="Enter how many you got right across both modules of each section." />
        <div className="flex flex-col gap-6 px-5 pb-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="rw" className="text-[14px] font-semibold">
                Reading & Writing correct
              </label>
              <Segmented
                label="R&W Module 2 route"
                value={rwRoute}
                onChange={setRwRoute}
                options={[
                  { value: 'harder', label: 'Harder Module 2' },
                  { value: 'easier', label: 'Easier Module 2' },
                ]}
              />
            </div>
            <NumberInput id="rw" value={rw} onChange={setRw} max={SAT_RW_MAX} label="Reading and Writing correct" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="math" className="text-[14px] font-semibold">
                Math correct
              </label>
              <Segmented
                label="Math Module 2 route"
                value={mathRoute}
                onChange={setMathRoute}
                options={[
                  { value: 'harder', label: 'Harder Module 2' },
                  { value: 'easier', label: 'Easier Module 2' },
                ]}
              />
            </div>
            <NumberInput id="math" value={math} onChange={setMath} max={SAT_MATH_MAX} label="Math correct" />
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-xl border border-line bg-sunken/50 p-4">
            <div>
              <p className="text-[12.5px] text-muted">Reading & Writing</p>
              <p className="num font-serif text-[26px] font-semibold">{est.rw}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-muted">Math</p>
              <p className="num font-serif text-[26px] font-semibold">{est.math}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-muted">Total</p>
              <p className="num font-serif text-[32px] leading-tight font-semibold">{est.total}</p>
              <Badge tone={delta >= 0 ? 'good' : 'warn'}>{delta >= 0 ? `+${delta} over target` : `${-delta} below target`}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                addPractice({ date: todayISO(), exam: 'sat', kind: 'full', source: 'Estimated from raw scores', rw: est.rw, math: est.math });
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              }}
            >
              <Save size={15} /> {saved ? 'Saved to Practice Log' : 'Save to Practice Log'}
            </Button>
          </div>
          <Disclaimer>
            The Digital SAT uses item-response theory: harder questions are worth more, so the same raw score can map to ±20–30 points. If your
            Module 1 goes badly you are routed to the easier Module 2, which caps the section at roughly 600–650. Use Bluebook’s own score
            report for official practice tests.
          </Disclaimer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Mistake budget" subtitle="How many questions you can miss (on the harder route) and still hit the target." />
        <div className="flex flex-col gap-4 px-5 pb-5">
          <Field label="Target total">
            {(id) => (
              <input
                id={id}
                type="number"
                min={400}
                max={1600}
                step={10}
                className="field num w-32"
                value={target}
                onChange={(e) => setTarget(Math.max(400, Math.min(1600, Number(e.target.value) || 400)))}
              />
            )}
          </Field>
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[12.5px] text-muted">
                <th className="py-2 font-medium">R&W</th>
                <th className="py-2 font-medium">Math</th>
                <th className="py-2 text-right font-medium">Misses allowed</th>
              </tr>
            </thead>
            <tbody>
              {balanced.map((s) => (
                <tr key={s.rw} className="border-b border-line last:border-b-0">
                  <td className="num py-2 font-semibold">{s.rw}</td>
                  <td className="num py-2 font-semibold">{s.math}</td>
                  <td className="num py-2 text-right text-ink-2">
                    ~{s.rwMisses} R&W · ~{s.mathMisses} Math
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {target >= 1500 && (
            <p className="text-[13px] text-ink-2">
              <span className="font-semibold text-ink">Coach’s read: </span>
              at {target}, a single careless error per module is the whole budget. Accuracy beats speed — your Mistake Log’s “careless” and
              “misread” tags are worth more than new content now.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function ApEstimator({ exam }: { exam: ExamId }) {
  const fmt = AP_FORMATS[exam]!;
  const addPractice = useStore((s) => s.addPractice);
  const [mcq, setMcq] = useState(Math.round(fmt.mcq * 0.7));
  const [frq, setFrq] = useState<number[]>(() => fmt.frq.map((q) => Math.round(q.max * 0.6)));
  const [saved, setSaved] = useState(false);
  const pct = apCompositePercent(exam, mcq, frq);
  const score = apScoreFromPercent(exam, pct);
  const need5 = apFrqPointsNeeded(exam, mcq, 5);
  const frqMax = fmt.frq.reduce((s, q) => s + q.max, 0);
  const frqGot = frq.reduce((s, v) => s + v, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader title={`${EXAMS[exam].name} — practice exam`} subtitle="Multiple choice and free response are each 50% of the composite." />
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="mcq" className="text-[14px] font-semibold">
              Multiple choice correct
            </label>
            <NumberInput id="mcq" value={mcq} onChange={setMcq} max={fmt.mcq} label="Multiple choice correct" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-[14px] font-semibold">
              Free-response points <span className="num font-normal text-muted">({frqGot}/{frqMax})</span>
            </p>
            {fmt.frq.map((q, i) => (
              <div key={q.label} className="grid items-center gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-3">
                <label htmlFor={`frq-${i}`} className="text-[13px] text-ink-2">
                  {q.label}
                </label>
                <NumberInput
                  id={`frq-${i}`}
                  value={frq[i]}
                  max={q.max}
                  label={q.label}
                  onChange={(v) => setFrq((list) => list.map((x, j) => (j === i ? v : x)))}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                addPractice({ date: todayISO(), exam, kind: 'full', source: 'Practice exam (score estimator)', percent: Math.round(pct * 10) / 10 });
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              }}
            >
              <Save size={15} /> {saved ? 'Saved to Practice Log' : 'Save to Practice Log'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="p-5">
          <p className="text-[12.5px] text-muted">Estimated AP score</p>
          <div className="mt-1 flex items-end gap-4">
            <p className="font-serif text-[64px] leading-none font-semibold">{score}</p>
            <div className="pb-1.5">
              <p className="num text-[15px] font-semibold">{pct.toFixed(1)}% composite</p>
              <p className="text-[12.5px] text-muted">
                {score === 5
                  ? `${(pct - fmt.cutoffs[5]).toFixed(1)} points of margin above the 5 line`
                  : need5 === null
                    ? 'A 5 needs more multiple-choice points first'
                    : `${need5} FRQ points needed for a 5 with this MCQ`}
              </p>
            </div>
          </div>
          <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
            {([1, 2, 3, 4, 5] as const).map((s) => {
              const lo = s === 1 ? 0 : fmt.cutoffs[s as 2 | 3 | 4 | 5];
              const hi = s === 5 ? 100 : fmt.cutoffs[(s + 1) as 2 | 3 | 4 | 5];
              return (
                <div
                  key={s}
                  className="h-full border-r-2 border-surface last:border-r-0"
                  style={{ width: `${hi - lo}%`, background: s === score ? `var(--exam-${exam})` : 'var(--line-strong)', opacity: s === score ? 1 : 0.45 }}
                />
              );
            })}
          </div>
          <div className="relative mt-1 h-4 text-[11px] text-muted" aria-hidden>
            <span className="absolute size-2 -translate-x-1/2 rounded-full bg-ink" style={{ left: `${Math.min(100, pct)}%`, top: -10 }} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Approximate cutoffs" />
          <table className="mx-5 mb-4 w-[calc(100%-2.5rem)] text-[13.5px]">
            <tbody>
              {([5, 4, 3, 2] as const).map((s) => (
                <tr key={s} className={cx('border-b border-line last:border-b-0', s === score && 'font-semibold')}>
                  <td className="py-2">Score {s}</td>
                  <td className="num py-2 text-right">≥ {fmt.cutoffs[s]}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 pb-5">
            <Disclaimer>{fmt.note} Cutoffs vary each year; treat a 5 as safe only with a 5–8 point margin.</Disclaimer>
          </div>
        </Card>
      </div>
    </div>
  );
}

const BAND_OPTIONS = Array.from({ length: 19 }, (_, i) => i / 2); // 0 … 9

function BandSelect({ id, value, onChange, label }: { id: string; value: number; onChange: (v: number) => void; label: string }) {
  return (
    <select id={id} aria-label={label} className="field num w-24" value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {BAND_OPTIONS.map((b) => (
        <option key={b} value={b}>
          {formatBand(b)}
        </option>
      ))}
    </select>
  );
}

function IeltsEstimator() {
  const savedTarget = useStore((s) => s.settings.exams.ielts.target);
  const addPractice = useStore((s) => s.addPractice);
  const [listening, setListening] = useState(32);
  const [reading, setReading] = useState(31);
  const [writing, setWriting] = useState(6.5);
  const [speaking, setSpeaking] = useState(7);
  const [target, setTarget] = useState(savedTarget);
  const [saved, setSaved] = useState(false);

  const lBand = ieltsBandFromRaw('listening', listening);
  const rBand = ieltsBandFromRaw('reading', reading);
  const overall = ieltsOverall([lBand, rBand, writing, speaking]);
  const avg = (lBand + rBand + writing + speaking) / 4;
  const diff = overall - target;
  const rows: { skill: string; band: number }[] = [
    { skill: 'Listening', band: lBand },
    { skill: 'Reading', band: rBand },
    { skill: 'Writing', band: writing },
    { skill: 'Speaking', band: speaking },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader title="Practice test → band" subtitle="Listening and Reading from correct answers (out of 40); Writing and Speaking from your marked or self-assessed band." />
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="ielts-l" className="text-[14px] font-semibold">
              Listening correct <span className="font-normal text-muted">→ band {formatBand(lBand)}</span>
            </label>
            <NumberInput id="ielts-l" value={listening} onChange={setListening} max={40} label="Listening correct" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="ielts-r" className="text-[14px] font-semibold">
              Academic Reading correct <span className="font-normal text-muted">→ band {formatBand(rBand)}</span>
            </label>
            <NumberInput id="ielts-r" value={reading} onChange={setReading} max={40} label="Reading correct" />
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ielts-w" className="text-[14px] font-semibold">
                Writing band
              </label>
              <BandSelect id="ielts-w" value={writing} onChange={setWriting} label="Writing band" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ielts-s" className="text-[14px] font-semibold">
                Speaking band
              </label>
              <BandSelect id="ielts-s" value={speaking} onChange={setSpeaking} label="Speaking band" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-sunken/50 p-4 sm:grid-cols-5">
            {rows.map((r) => (
              <div key={r.skill}>
                <p className="text-[12.5px] text-muted">{r.skill}</p>
                <p className="num font-serif text-[24px] font-semibold">{formatBand(r.band)}</p>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[12.5px] text-muted">Overall</p>
              <p className="num font-serif text-[32px] leading-tight font-semibold">{formatBand(overall)}</p>
              <Badge tone={diff >= 0 ? 'good' : 'warn'}>{diff >= 0 ? 'Target reached' : `${formatBand(-diff)} below target`}</Badge>
            </div>
          </div>
          <p className="text-[12.5px] text-muted">
            Average {avg.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')} rounds to {formatBand(overall)}.
          </p>
          <div>
            <Button
              onClick={() => {
                addPractice({ date: todayISO(), exam: 'ielts', kind: 'full', source: 'Practice test (score estimator)', band: overall });
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              }}
            >
              <Save size={15} /> {saved ? 'Saved to Practice Log' : 'Save to Practice Log'}
            </Button>
          </div>
          <Disclaimer>
            Listening and Reading use the typical conversion tables published by IELTS; boundaries can move by a mark between test versions.
            General Training Reading uses a different, stricter table.
          </Disclaimer>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="What your target needs" subtitle="Minimum correct answers out of 40 for each band." />
          <div className="flex flex-col gap-4 px-5 pb-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ielts-target" className="text-[13px] font-medium text-ink-2">
                Target band
              </label>
              <BandSelect id="ielts-target" value={target} onChange={setTarget} label="Target band" />
            </div>
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[12.5px] text-muted">
                  <th className="py-2 font-medium">Band</th>
                  <th className="py-2 font-medium">Listening</th>
                  <th className="py-2 font-medium">Reading</th>
                </tr>
              </thead>
              <tbody>
                {[target - 0.5, target, target + 0.5]
                  .filter((b) => b >= 4 && b <= 9)
                  .map((b) => (
                    <tr key={b} className={cx('border-b border-line last:border-b-0', b === target && 'font-semibold')}>
                      <td className="num py-2">{formatBand(b)}</td>
                      <td className="num py-2">{ieltsRawNeeded('listening', b) ?? '—'} / 40</td>
                      <td className="num py-2">{ieltsRawNeeded('reading', b) ?? '—'} / 40</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-5 text-[13.5px] text-ink-2">
          <p className="font-semibold text-ink">How the overall band is rounded</p>
          <p className="mt-1">
            The four skill bands are averaged. A fraction of .25 rounds up to the next half band and .75 rounds up to the next whole band;
            anything lower rounds down.
          </p>
          <ul className="mt-2 flex flex-col gap-0.5 text-[13px]">
            <li className="num">7 + 7 + 7 + 8 = 7.25 → 7.5</li>
            <li className="num">7 + 7 + 7.5 + 7 = 7.125 → 7.0</li>
            <li className="num">7.5 + 8 + 7.5 + 8 = 7.75 → 8.0</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function Scores() {
  const exams = useActiveExams();
  const [exam, setExam] = useState<ExamId>(exams[0] ?? 'sat');
  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Score Estimator"
        description="Convert practice raw scores into estimated scaled scores and IELTS bands, and see exactly how much room for error your targets leave."
      />
      <Segmented
        label="Exam"
        className="mb-5"
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
      {exam === 'sat' ? <SatEstimator /> : exam === 'ielts' ? <IeltsEstimator /> : <ApEstimator key={exam} exam={exam} />}
    </>
  );
}
