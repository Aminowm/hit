import type { Course } from '../../lib/types';
import { unit } from './build';

/** Digital SAT — content domains and skills from the College Board test specifications. */
export const SAT_COURSE: Course = {
  exam: 'sat',
  title: 'Digital SAT',
  source: 'College Board · SAT Suite test specifications (domains & skills)',
  units: [
    unit('sat', 'RW1', 'Information and Ideas', [26, 26], [
      ['', 'Central Ideas and Details', 'Answer must be supported by the WHOLE passage, not one sentence.'],
      ['', 'Command of Evidence: Textual', 'Find the quote that would most directly support/weaken the specific claim.'],
      ['', 'Command of Evidence: Quantitative', 'Read the axis labels first; the right answer is true per the graph AND relevant to the claim.'],
      ['', 'Inferences', 'Pick the most logical completion — no outside knowledge, no extreme language.'],
    ], { section: 'Reading & Writing' }),
    unit('sat', 'RW2', 'Craft and Structure', [28, 28], [
      ['', 'Words in Context', 'Predict a word before looking at choices; secondary meanings are common traps.'],
      ['', 'Text Structure and Purpose', 'Ask "why did the author include this sentence?" — function, not content.'],
      ['', 'Cross-Text Connections', 'State how Text 2’s author would respond to Text 1 in your own words first.'],
    ], { section: 'Reading & Writing' }),
    unit('sat', 'RW3', 'Expression of Ideas', [20, 20], [
      ['', 'Rhetorical Synthesis (student notes)', 'Only read the goal in the question stem, then match it — skip the notes until needed.'],
      ['', 'Transitions', 'Label the relationship (contrast / continuation / cause / example) before choosing.'],
    ], { section: 'Reading & Writing' }),
    unit('sat', 'RW4', 'Standard English Conventions', [26, 26], [
      ['B1', 'Boundaries: sentence boundaries (run-ons, comma splices, fragments)'],
      ['B2', 'Boundaries: semicolons, colons and dashes', 'A colon needs a complete sentence before it; a semicolon needs one on both sides.'],
      ['B3', 'Boundaries: supplementary elements & comma pairs'],
      ['F1', 'Form, Structure & Sense: subject–verb agreement', 'Cross out prepositional phrases between subject and verb.'],
      ['F2', 'Form, Structure & Sense: pronoun–antecedent agreement'],
      ['F3', 'Form, Structure & Sense: verb tense and form'],
      ['F4', 'Form, Structure & Sense: plurals and possessives'],
      ['F5', 'Form, Structure & Sense: modifier placement', 'The noun right after the comma must be the one doing the -ing action.'],
    ], { section: 'Reading & Writing' }),

    unit('sat', 'M1', 'Algebra', [35, 35], [
      ['', 'Linear equations in one variable'],
      ['', 'Linear functions (slope, intercept, interpretation)', 'Know what slope and y-intercept MEAN in context — a favorite question.'],
      ['', 'Linear equations in two variables'],
      ['', 'Systems of two linear equations', 'No solution ⇔ same slope, different intercept; infinitely many ⇔ identical lines.'],
      ['', 'Linear inequalities in one or two variables'],
    ], { section: 'Math' }),
    unit('sat', 'M2', 'Advanced Math', [35, 35], [
      ['', 'Equivalent expressions (factoring, exponents, rational expressions)'],
      ['', 'Nonlinear equations & systems', 'Desmos: graph both sides and read the intersections.'],
      ['', 'Quadratic functions: vertex, factored & standard forms; discriminant'],
      ['', 'Exponential functions: growth/decay, percent rate', 'f(t) = a(1 ± r)^t — identify a, r and the time unit.'],
      ['', 'Polynomial, rational and radical functions'],
      ['', 'Function notation, composition & transformations'],
    ], { section: 'Math' }),
    unit('sat', 'M3', 'Problem-Solving and Data Analysis', [15, 15], [
      ['', 'Ratios, rates, proportional relationships and units'],
      ['', 'Percentages (percent change, of/is)', 'Successive changes multiply: +20% then −20% is ×0.96.'],
      ['', 'One-variable data: center, spread, distributions', 'Know when adding an outlier changes mean vs. median vs. standard deviation.'],
      ['', 'Two-variable data: models and scatterplots'],
      ['', 'Probability and conditional probability (two-way tables)'],
      ['', 'Inference from samples & margin of error'],
      ['', 'Evaluating statistical claims: observational studies & experiments', 'Random assignment ⇒ causation; random sampling ⇒ generalize to population.'],
    ], { section: 'Math' }),
    unit('sat', 'M4', 'Geometry and Trigonometry', [15, 15], [
      ['', 'Area and volume'],
      ['', 'Lines, angles and triangles (similarity, congruence)'],
      ['', 'Right triangles and trigonometry', 'sin x = cos(90° − x) appears almost every test.'],
      ['', 'Circles: equation, arcs, sectors, radians', 'Complete the square to get (x − h)² + (y − k)² = r².'],
    ], { section: 'Math' }),
  ],
};
