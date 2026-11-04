import { describe, expect, it } from 'vitest';
import { IELTS_RESOURCES } from '../data/ieltsResources';
import { IELTS_COURSE } from '../data/topics/ielts';
import { formatBand, ieltsBandFromRaw, ieltsOverall, ieltsRawNeeded } from './scoring';

describe('IELTS band conversion', () => {
  it('maps Listening raw scores to the published bands', () => {
    expect(ieltsBandFromRaw('listening', 40)).toBe(9);
    expect(ieltsBandFromRaw('listening', 35)).toBe(8);
    expect(ieltsBandFromRaw('listening', 32)).toBe(7.5);
    expect(ieltsBandFromRaw('listening', 30)).toBe(7);
    expect(ieltsBandFromRaw('listening', 29)).toBe(6.5);
    expect(ieltsBandFromRaw('listening', 23)).toBe(6);
  });

  it('maps Academic Reading raw scores to the published bands', () => {
    expect(ieltsBandFromRaw('reading', 39)).toBe(9);
    expect(ieltsBandFromRaw('reading', 33)).toBe(7.5);
    expect(ieltsBandFromRaw('reading', 32)).toBe(7);
    expect(ieltsBandFromRaw('reading', 30)).toBe(7);
    expect(ieltsBandFromRaw('reading', 26)).toBe(6);
  });

  it('is monotonic and clamps out-of-range input', () => {
    for (const skill of ['listening', 'reading'] as const) {
      let prev = 0;
      for (let raw = 0; raw <= 40; raw++) {
        const b = ieltsBandFromRaw(skill, raw);
        expect(b).toBeGreaterThanOrEqual(prev);
        prev = b;
      }
      expect(ieltsBandFromRaw(skill, 99)).toBe(9);
      expect(ieltsBandFromRaw(skill, -3)).toBe(0);
    }
  });

  it('finds the minimum raw score for a band', () => {
    expect(ieltsRawNeeded('listening', 7.5)).toBe(32);
    expect(ieltsRawNeeded('reading', 7.5)).toBe(33);
    expect(ieltsRawNeeded('reading', 9)).toBe(39);
    expect(ieltsBandFromRaw('reading', ieltsRawNeeded('reading', 7)!)).toBe(7);
  });
});

describe('IELTS overall band rounding', () => {
  it('rounds .25 up to the half band and .75 up to the whole band', () => {
    expect(ieltsOverall([7, 7, 7, 8])).toBe(7.5); // 7.25
    expect(ieltsOverall([7, 7, 7.5, 7])).toBe(7); // 7.125
    expect(ieltsOverall([7.5, 8, 7.5, 8])).toBe(8); // 7.75
    expect(ieltsOverall([6.5, 6.5, 6.5, 7])).toBe(6.5); // 6.625
    expect(ieltsOverall([6, 6, 6, 6])).toBe(6);
    expect(ieltsOverall([9, 9, 9, 9])).toBe(9);
  });

  it('formats bands with one decimal', () => {
    expect(formatBand(7)).toBe('7.0');
    expect(formatBand(7.5)).toBe('7.5');
  });
});

describe('IELTS content', () => {
  it('covers all four skills with stable unit ids', () => {
    expect(IELTS_COURSE.units.map((u) => u.id)).toEqual(['ielts.L', 'ielts.R', 'ielts.W', 'ielts.S']);
  });

  it('has resources for every skill, with the four Testify links featured', () => {
    for (const skill of ['listening', 'reading', 'writing', 'speaking'] as const) {
      expect(IELTS_RESOURCES.filter((r) => r.skills?.includes(skill)).length).toBeGreaterThanOrEqual(5);
    }
    const featured = IELTS_RESOURCES.filter((r) => r.featured).map((r) => r.url);
    expect(featured).toEqual([
      'https://bil.testify.kz/courses/10',
      'https://bil.testify.kz/courses/9',
      'https://bil.testify.kz/flashcards/31',
      'https://bil.testify.kz/flashcards/36',
    ]);
  });
});
