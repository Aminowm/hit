import type { ExamId, Formula } from '../../lib/types';
import { CALCBC_FORMULAS } from './calcbc';
import { PHYS1_FORMULAS, PHYSC_FORMULAS } from './physics';
import { SAT_FORMULAS } from './sat';

export const FORMULAS: Record<ExamId, Formula[]> = {
  sat: SAT_FORMULAS,
  calcbc: CALCBC_FORMULAS,
  phys1: PHYS1_FORMULAS,
  physc: PHYSC_FORMULAS,
};

export const ALL_FORMULAS: Formula[] = Object.values(FORMULAS).flat();
