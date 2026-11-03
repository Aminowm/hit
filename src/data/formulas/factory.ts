import type { ExamId, Formula } from '../../lib/types';

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Formula constructor with a stable id derived from exam + group + name.
 * Ids are used as flashcard ids, so renaming a formula resets its review history.
 */
export function formulaFactory(exam: ExamId) {
  return (group: string, name: string, tex: string, provided: boolean, note?: string): Formula => ({
    id: `${exam}:${slug(group)}:${slug(name)}`,
    exam,
    group,
    name,
    tex,
    provided,
    note,
  });
}
