import { stackTex } from '../lib/tex';
import type { ExamId, Flashcard } from '../lib/types';
import { ALL_FORMULAS } from './formulas';

/** Concept cards — the rules and justifications graders and test-writers look for. */
const concept = (exam: ExamId, id: string, front: string, back: string): Flashcard => ({
  id: `concept:${exam}:${id}`,
  exam,
  deck: 'Concepts',
  front,
  back,
});

export const CONCEPT_CARDS: Flashcard[] = [
  concept('sat', 'colon', 'When can you use a colon?', 'Only after a **complete sentence** (independent clause). What follows explains or lists.'),
  concept('sat', 'semicolon', 'What does a semicolon join?', 'Two **independent clauses** — it works exactly like a period.'),
  concept('sat', 'modifier', 'How do you fix a dangling modifier?', 'The noun right after the introductory phrase must be the thing the phrase describes.'),
  concept('sat', 'sva', 'Subject–verb agreement trick?', 'Cross out prepositional phrases and non-essential clauses between subject and verb.'),
  concept('sat', 'transitions', 'However vs. therefore vs. moreover?', 'However = contrast · Therefore = consequence · Moreover = adds a similar point.'),
  concept('sat', 'causation', 'When does a study support cause-and-effect? When can it be generalized?', 'Random **assignment** ⇒ causation. Random **sampling** ⇒ generalize to the population sampled.'),
  concept('sat', 'mean-median', 'Adding a large outlier: what happens to mean, median, SD?', 'Mean ↑ a lot · median barely moves · standard deviation ↑.'),
  concept('calcbc', 'mvt', 'Hypotheses of the Mean Value Theorem?', 'f continuous on $[a,b]$ **and** differentiable on $(a,b)$.'),
  concept('calcbc', 'ivt', 'Hypothesis of the Intermediate Value Theorem?', 'f continuous on $[a,b]$ — then f takes every value between $f(a)$ and $f(b)$.'),
  concept('calcbc', 'evt', 'Hypothesis of the Extreme Value Theorem?', 'f continuous on a **closed** interval $[a,b]$ ⇒ absolute max and min exist.'),
  concept('calcbc', 'rel-max', 'Justify a relative maximum using f′.', '$f\'$ changes sign from positive to negative at $x = c$.'),
  concept('calcbc', 'inflection', 'Justify a point of inflection.', '$f\'\'$ changes sign at $x = c$ (equivalently, $f\'$ changes from increasing to decreasing or vice versa).'),
  concept('calcbc', 'speeding', 'When is a particle speeding up?', 'When velocity and acceleration have the **same sign**.'),
  concept('calcbc', 'nth-term', 'What does $\\lim a_n = 0$ tell you about $\\sum a_n$?', 'Nothing — the nth-term test can only prove **divergence** (when the limit ≠ 0).'),
  concept('calcbc', 'conditional', 'Absolute vs. conditional convergence?', 'Absolute: $\\sum|a_n|$ converges. Conditional: $\\sum a_n$ converges but $\\sum|a_n|$ diverges (e.g. alternating harmonic).'),
  concept('calcbc', 'ivt-frq', 'An FRQ asks "must there be a time when r(t) = 5?" Which theorem?', 'IVT if you know r(t) values; MVT if the question is about $r\'(t)$ equal to an average rate.'),
  concept('phys1', 'n3', 'Newton’s third-law pairs act on…?', '**Different** objects; equal magnitude, opposite direction, same type of force.'),
  concept('phys1', 'p-conserved', 'When is the momentum of a system conserved?', 'When the net **external** impulse (force × time) on the system is zero.'),
  concept('phys1', 'e-conserved', 'When is mechanical energy conserved?', 'When no non-conservative forces (friction, applied pushes) do work on the system.'),
  concept('phys1', 'l-conserved', 'When is angular momentum conserved?', 'When the net **external torque** on the system is zero.'),
  concept('phys1', 'buoyancy', 'Buoyant force equals…?', 'The **weight of the fluid displaced**: $F_b = \\rho_{fluid} V_{disp}\\, g$.'),
  concept('phys1', 'normal', 'Is the normal force always equal to mg?', 'No — only on a flat surface with no other vertical forces and no vertical acceleration.'),
  concept('physc', 'drag', 'Linear drag: terminal velocity and time constant?', '$v_T = \\dfrac{mg}{b}$, $\\tau = \\dfrac{m}{b}$; $v(t) = v_T(1 - e^{-t/\\tau})$.'),
  concept('physc', 'equilibrium', 'Stable vs. unstable equilibrium from U(x)?', 'Equilibrium where $dU/dx = 0$; stable at a minimum of U, unstable at a maximum.'),
  concept('physc', 'shm', 'How do you prove motion is simple harmonic?', 'Show the restoring force (or torque) gives $\\ddot{x} = -\\omega^2 x$; then $\\omega$ is the square root of the coefficient.'),
  concept('ielts', 'link-addition', 'Linking words: **addition**', 'Moreover · Furthermore · In addition · Besides · What is more · Not only … but also'),
  concept('ielts', 'link-example', 'Linking words: **exemplification & clarification**', 'For example · For instance · Such as · Namely · To illustrate · In other words · That is to say'),
  concept('ielts', 'link-contrast', 'Linking words: **contrast & concession**', 'However · Nevertheless · On the other hand · Whereas · While · Although · Despite / In spite of (+ noun)'),
  concept('ielts', 'link-cause', 'Linking words: **cause & effect**', 'Therefore · Consequently · As a result · Thus · Due to / Owing to / Because of (+ noun)'),
  concept('ielts', 'link-conclusion', 'Linking words: **concluding**', 'In conclusion · To sum up · On balance · Overall (opens a Task 1 overview)'),
  concept('ielts', 'task2-basics', 'Writing Task 2: time, length, weight?', 'About **40 minutes**, at least **250 words**, and worth **twice as much** as Task 1.'),
  concept('ielts', 'task1-overview', 'What must every Task 1 report include?', 'A clear **overview** of the main trends or features (no opinions). Without it, Task Achievement rarely goes above band 5.'),
  concept('ielts', 'opinion-structure', 'Structure of an **opinion** essay?', 'Introduction (paraphrase + clear position) → two body paragraphs, each one reason with an example → conclusion restating your position.'),
  concept('ielts', 'discussion-structure', 'Structure of a **discussion** essay (“discuss both views and give your opinion”)?', 'Introduction → paragraph on view 1 → paragraph on view 2 → conclusion with your opinion (state it in the introduction too).'),
  concept('ielts', 'writing-criteria', 'The four Writing criteria?', 'Task Achievement / Task Response · Coherence & Cohesion · Lexical Resource · Grammatical Range & Accuracy (25% each).'),
  concept('ielts', 'speaking-criteria', 'The four Speaking criteria?', 'Fluency & Coherence · Lexical Resource · Grammatical Range & Accuracy · Pronunciation (25% each).'),
  concept('ielts', 'tfng-ynng', 'True/False/Not Given vs Yes/No/Not Given?', 'T/F/NG checks **facts** in the text; Y/N/NG checks the **writer’s views or claims**.'),
  concept('ielts', 'false-ng', '“False” vs “Not Given”?', 'False: the text **contradicts** the statement. Not Given: the text gives **no information** about it.'),
  concept('ielts', 'part2', 'Speaking Part 2 timing?', '1 minute to prepare (notes allowed), then speak for **up to 2 minutes**; the examiner may ask one or two short follow-up questions.'),
  concept('ielts', 'rounding', 'How is the overall band rounded?', 'Average of the four skills: **.25 rounds up** to the next half band, **.75 rounds up** to the next whole band (6.25 → 6.5, 6.75 → 7).'),
  concept('ielts', 'word-limit', '“NO MORE THAN TWO WORDS AND/OR A NUMBER”: what if you write three words?', 'The answer is marked **wrong**, even if the content is right. Hyphenated words count as one word.'),
];

/** Every formula becomes a recall card: name → formula. */
export const FORMULA_CARDS: Flashcard[] = ALL_FORMULAS.map((f) => ({
  id: `formula:${f.id}`,
  exam: f.exam,
  deck: 'Formulas',
  front: `${f.name}\n_${f.group}_`,
  back: `$$${stackTex(f.tex)}$$${f.note ? `\n${f.note}` : ''}`,
}));

export const BUILTIN_CARDS: Flashcard[] = [...FORMULA_CARDS, ...CONCEPT_CARDS];
