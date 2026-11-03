import { describe, expect, it } from 'vitest';
import {
  AP_FORMATS,
  apCompositePercent,
  apFrqPointsNeeded,
  apScoreFromPercent,
  estimateSat,
  estimateSatSection,
  interpolate,
  satMissBudget,
  satTargetSplits,
} from './scoring';

describe('interpolate', () => {
  it('interpolates linearly between anchors and clamps outside', () => {
    const a: [number, number][] = [[0, 0], [10, 100]];
    expect(interpolate(a, 5)).toBe(50);
    expect(interpolate(a, -3)).toBe(0);
    expect(interpolate(a, 99)).toBe(100);
  });
});

describe('SAT estimator', () => {
  it('maps perfect raw scores to 800 on the harder route', () => {
    expect(estimateSatSection('rw', 54, 'harder')).toBe(800);
    expect(estimateSatSection('math', 44, 'harder')).toBe(800);
  });

  it('caps the easier route well below 800', () => {
    expect(estimateSatSection('math', 44, 'easier')).toBeLessThanOrEqual(650);
    expect(estimateSatSection('rw', 54, 'easier')).toBeLessThanOrEqual(650);
  });

  it('is monotonic and returns multiples of 10 within 200–800', () => {
    for (const section of ['rw', 'math'] as const) {
      const max = section === 'rw' ? 54 : 44;
      let prev = 0;
      for (let raw = 0; raw <= max; raw++) {
        const s = estimateSatSection(section, raw, 'harder');
        expect(s % 10).toBe(0);
        expect(s).toBeGreaterThanOrEqual(prev);
        expect(s).toBeGreaterThanOrEqual(200);
        expect(s).toBeLessThanOrEqual(800);
        prev = s;
      }
    }
  });

  it('sums section scores into the total', () => {
    const r = estimateSat(52, 42, 'harder', 'harder');
    expect(r.total).toBe(r.rw + r.math);
  });

  it('computes small mistake budgets for a 1550', () => {
    expect(satMissBudget('math', 800)).toBe(0);
    const splits = satTargetSplits(1550);
    expect(splits.every((s) => s.rw + s.math === 1550)).toBe(true);
    const even = splits.find((s) => s.rw === 770)!;
    expect(even.rwMisses).toBeGreaterThanOrEqual(1);
    expect(even.mathMisses).toBeGreaterThanOrEqual(1);
    expect(even.rwMisses + even.mathMisses).toBeLessThanOrEqual(6);
  });
});

describe('AP estimator', () => {
  it('weights MCQ and FRQ 50/50', () => {
    const f = AP_FORMATS.calcbc!;
    expect(apCompositePercent('calcbc', f.mcq, f.frq.map((q) => q.max))).toBeCloseTo(100);
    expect(apCompositePercent('calcbc', f.mcq, f.frq.map(() => 0))).toBeCloseTo(50);
    expect(apCompositePercent('calcbc', 0, f.frq.map((q) => q.max))).toBeCloseTo(50);
  });

  it('clamps out-of-range inputs', () => {
    expect(apCompositePercent('physc', 999, [999, 999, 999, 999])).toBeCloseTo(100);
    expect(apCompositePercent('physc', -5, [-1, -1, -1, -1])).toBeCloseTo(0);
  });

  it('maps composites to scores using the cutoffs', () => {
    const c = AP_FORMATS.calcbc!.cutoffs;
    expect(apScoreFromPercent('calcbc', c[5])).toBe(5);
    expect(apScoreFromPercent('calcbc', c[5] - 0.1)).toBe(4);
    expect(apScoreFromPercent('calcbc', 0)).toBe(1);
  });

  it('computes FRQ points needed for a 5', () => {
    const f = AP_FORMATS.calcbc!;
    expect(apFrqPointsNeeded('calcbc', f.mcq, 5)).toBeGreaterThan(0);
    // Spread points across the six 9-point questions.
    const spread = (pts: number) => f.frq.map((q, i) => Math.max(0, Math.min(q.max, pts - i * q.max)));
    const need = apFrqPointsNeeded('calcbc', 30, 5)!;
    expect(apScoreFromPercent('calcbc', apCompositePercent('calcbc', 30, spread(need)))).toBe(5);
    expect(apScoreFromPercent('calcbc', apCompositePercent('calcbc', 30, spread(need - 1)))).toBe(4);
    expect(apFrqPointsNeeded('calcbc', 0, 5)).toBeNull();
  });
});
