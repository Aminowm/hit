import type { Course, ExamId, Topic, Unit } from '../../lib/types';
import { CALCBC_COURSE } from './calcbc';
import { PHYS1_COURSE, PHYSC_COURSE } from './physics';
import { SAT_COURSE } from './sat';

export const COURSES: Record<ExamId, Course> = {
  sat: SAT_COURSE,
  calcbc: CALCBC_COURSE,
  phys1: PHYS1_COURSE,
  physc: PHYSC_COURSE,
};

export interface TopicRef {
  exam: ExamId;
  unit: Unit;
  topic: Topic;
}

/** Flat lookup of every topic by id (used by the mistake log). */
export const TOPIC_INDEX: Map<string, TopicRef> = new Map(
  Object.values(COURSES).flatMap((course) =>
    course.units.flatMap((unit) => unit.topics.map((topic) => [topic.id, { exam: course.exam, unit, topic }] as const)),
  ),
);
