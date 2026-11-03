import type { Formula } from '../../lib/types';
import { formulaFactory } from './factory';

const f = formulaFactory('sat');
const r = String.raw;

/** Digital SAT Math. `provided` = printed on the Bluebook reference sheet. */
export const SAT_FORMULAS: Formula[] = [
  // Reference sheet
  f('Geometry (reference sheet)', 'Circle: area & circumference', r`A = \pi r^2 \qquad C = 2\pi r`, true),
  f('Geometry (reference sheet)', 'Triangle area', r`A = \tfrac{1}{2}bh`, true),
  f('Geometry (reference sheet)', 'Pythagorean theorem', r`a^2 + b^2 = c^2`, true),
  f('Geometry (reference sheet)', 'Special right triangles', r`30^\circ\!-\!60^\circ\!-\!90^\circ:\; x,\ x\sqrt{3},\ 2x \qquad 45^\circ\!-\!45^\circ\!-\!90^\circ:\; s,\ s,\ s\sqrt{2}`, true),
  f('Geometry (reference sheet)', 'Volume: box, cylinder', r`V = \ell wh \qquad V = \pi r^2 h`, true),
  f('Geometry (reference sheet)', 'Volume: sphere, cone, pyramid', r`V = \tfrac{4}{3}\pi r^3 \qquad V = \tfrac{1}{3}\pi r^2 h \qquad V = \tfrac{1}{3}\ell w h`, true),
  f('Geometry (reference sheet)', 'Angle facts', r`\text{circle} = 360^\circ = 2\pi \text{ rad} \qquad \text{triangle angles sum to } 180^\circ`, true),

  // Memorize — algebra
  f('Algebra', 'Slope', r`m = \frac{y_2 - y_1}{x_2 - x_1}`, false, 'Parallel lines: equal slopes. Perpendicular: slopes multiply to −1.'),
  f('Algebra', 'Line forms', r`y = mx + b \qquad y - y_1 = m(x - x_1) \qquad Ax + By = C \;\Rightarrow\; m = -\tfrac{A}{B}`, false),
  f('Algebra', 'Systems: number of solutions', r`\text{same slope, different } b \Rightarrow \text{no solution} \qquad \text{same line} \Rightarrow \text{infinitely many} \qquad \text{different slopes} \Rightarrow \text{exactly one}`, false, 'For ax + by = c, compare a₁/a₂, b₁/b₂, c₁/c₂.'),
  f('Algebra', 'Distance & midpoint', r`d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2} \qquad M = \left(\tfrac{x_1+x_2}{2}, \tfrac{y_1+y_2}{2}\right)`, false),

  // Memorize — advanced math
  f('Advanced Math', 'Quadratic formula', r`x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`, false),
  f('Advanced Math', 'Discriminant', r`\Delta = b^2 - 4ac \qquad \Delta>0 \text{: two} \quad \Delta=0 \text{: one} \quad \Delta<0 \text{: none (real)}`, false, 'Frequently asked: "for what value of k does the system have exactly one solution?"'),
  f('Advanced Math', 'Vertex', r`x_v = -\frac{b}{2a} \qquad y = a(x-h)^2 + k \;\text{has vertex}\; (h, k)`, false),
  f('Advanced Math', 'Sum & product of roots', r`r_1 + r_2 = -\frac{b}{a} \qquad r_1 r_2 = \frac{c}{a}`, false, 'Saves time when the question asks for the sum of solutions.'),
  f('Advanced Math', 'Exponential growth / decay', r`f(t) = a(1 \pm r)^{t} \qquad f(t) = a \cdot b^{t/k}`, false, 'b^(t/k): the quantity multiplies by b every k units of time.'),
  f('Advanced Math', 'Exponent rules', r`a^m a^n = a^{m+n} \quad \frac{a^m}{a^n} = a^{m-n} \qquad (a^m)^n = a^{mn} \quad a^{m/n} = \sqrt[n]{a^m}`, false),

  // Memorize — data
  f('Problem-Solving & Data', 'Percent change', r`\%\Delta = \frac{\text{new} - \text{old}}{\text{old}} \times 100`, false, 'Increase by p%: multiply by (1 + p/100).'),
  f('Problem-Solving & Data', 'Mean', r`\bar{x} = \frac{\text{sum of values}}{n}`, false, 'New mean after adding a value: (n·x̄ + v)/(n + 1).'),
  f('Problem-Solving & Data', 'Conditional probability', r`P(A \mid B) = \frac{P(A \cap B)}{P(B)}`, false, 'From a two-way table: the denominator is the row/column you were "given".'),
  f('Problem-Solving & Data', 'Margin of error', r`\text{estimate} \pm \text{MOE}`, false, 'Larger sample → smaller margin of error.'),

  // Memorize — geometry & trig
  f('Geometry & Trig', 'Circle equation', r`(x-h)^2 + (y-k)^2 = r^2`, false, 'From x² + y² + Dx + Ey + F = 0, complete the square twice.'),
  f('Geometry & Trig', 'Arc length & sector area', r`s = r\theta \qquad A = \tfrac{1}{2}r^2\theta \quad (\theta \text{ in radians})`, false, 'Degree version: (θ/360)·2πr and (θ/360)·πr².'),
  f('Geometry & Trig', 'SOH-CAH-TOA', r`\sin\theta = \frac{\text{opp}}{\text{hyp}} \quad \cos\theta = \frac{\text{adj}}{\text{hyp}} \qquad \tan\theta = \frac{\text{opp}}{\text{adj}}`, false),
  f('Geometry & Trig', 'Complementary angles', r`\sin x^\circ = \cos(90^\circ - x^\circ)`, false, 'Appears on almost every test.'),
  f('Geometry & Trig', 'Radians ↔ degrees', r`\pi \text{ rad} = 180^\circ`, false),
  f('Geometry & Trig', 'Similar figures scale', r`\text{lengths} \times k \qquad \Rightarrow\ \text{area} \times k^2,\ \ \text{volume} \times k^3`, false),
];
