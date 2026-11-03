import type { Formula } from '../../lib/types';
import { formulaFactory } from './factory';

const f = formulaFactory('calcbc');
const r = String.raw;

/** AP Calculus BC has NO formula sheet — everything here must be memorized. */
export const CALCBC_FORMULAS: Formula[] = [
  // Limits
  f('Limits', 'Special trig limits', r`\lim_{x\to 0}\frac{\sin x}{x} = 1 \qquad \lim_{x\to 0}\frac{1-\cos x}{x} = 0`, false),
  f('Limits', 'Definition of e', r`e = \lim_{n\to\infty}\left(1 + \frac{1}{n}\right)^n`, false),
  f('Limits', 'Definition of the derivative', r`f'(a) = \lim_{h\to 0}\frac{f(a+h) - f(a)}{h} \qquad f'(a) = \lim_{x\to a}\frac{f(x)-f(a)}{x-a}`, false, 'Spot it in disguise: a limit that equals a derivative of a known function.'),
  f('Limits', 'L’Hôpital’s rule', r`\text{If } \tfrac{0}{0} \text{ or } \tfrac{\infty}{\infty}: \qquad \lim\frac{f(x)}{g(x)} = \lim\frac{f'(x)}{g'(x)}`, false, 'On FRQs, show both limits are 0 (or ±∞) first.'),

  // Derivative rules
  f('Derivative rules', 'Product & quotient rules', r`(fg)' = f'g + fg' \qquad \left(\frac{f}{g}\right)' = \frac{f'g - fg'}{g^2}`, false),
  f('Derivative rules', 'Chain rule', r`\frac{d}{dx}f(g(x)) = f'(g(x))\,g'(x)`, false),
  f('Derivative rules', 'Inverse function derivative', r`\left(f^{-1}\right)'(a) = \frac{1}{f'\!\left(f^{-1}(a)\right)}`, false),
  f('Derivative rules', 'Trig derivatives', r`(\sin x)' = \cos x \qquad (\cos x)' = -\sin x \qquad (\tan x)' = \sec^2 x`, false),
  f('Derivative rules', 'Reciprocal trig derivatives', r`(\sec x)' = \sec x\tan x \qquad (\csc x)' = -\csc x\cot x \qquad (\cot x)' = -\csc^2 x`, false),
  f('Derivative rules', 'Exponential & log derivatives', r`(e^x)' = e^x \qquad (a^x)' = a^x\ln a \qquad (\ln x)' = \frac{1}{x} \qquad (\log_a x)' = \frac{1}{x\ln a}`, false),
  f('Derivative rules', 'Inverse trig derivatives', r`(\arcsin x)' = \frac{1}{\sqrt{1-x^2}} \qquad (\arctan x)' = \frac{1}{1+x^2}`, false),

  // Theorems
  f('Theorems', 'Mean Value Theorem', r`f \text{ continuous on } [a,b],\ \text{differentiable on } (a,b) \qquad \Rightarrow\ \exists\, c \in (a,b):\ f'(c) = \frac{f(b)-f(a)}{b-a}`, false, 'State both hypotheses on FRQs to earn the point.'),
  f('Theorems', 'Fundamental Theorem (part 1)', r`\frac{d}{dx}\int_a^{g(x)} f(t)\,dt = f(g(x))\,g'(x)`, false),
  f('Theorems', 'Fundamental Theorem (part 2)', r`\int_a^b f'(x)\,dx = f(b) - f(a)`, false, 'Net change: f(b) = f(a) + ∫ₐᵇ f′(x) dx — the #1 FRQ move.'),
  f('Theorems', 'Average value', r`f_{\text{avg}} = \frac{1}{b-a}\int_a^b f(x)\,dx`, false),

  // Integrals
  f('Integrals', 'Power & log rules', r`\int x^n\,dx = \frac{x^{n+1}}{n+1} + C\ (n\neq -1) \qquad \int \frac{dx}{x} = \ln|x| + C`, false),
  f('Integrals', 'Exponential integrals', r`\int e^x\,dx = e^x + C \qquad \int a^x\,dx = \frac{a^x}{\ln a} + C`, false),
  f('Integrals', 'Trig integrals', r`\int \sin x\,dx = -\cos x + C \qquad \int \cos x\,dx = \sin x + C \qquad \int \sec^2 x\,dx = \tan x + C`, false),
  f('Integrals', 'More trig integrals', r`\int \sec x\tan x\,dx = \sec x + C \qquad \int \tan x\,dx = -\ln|\cos x| + C`, false),
  f('Integrals', 'Inverse trig integrals', r`\int \frac{dx}{a^2 + x^2} = \frac{1}{a}\arctan\frac{x}{a} + C \qquad \int \frac{dx}{\sqrt{a^2 - x^2}} = \arcsin\frac{x}{a} + C`, false),
  f('Integrals', 'Integration by parts', r`\int u\,dv = uv - \int v\,du`, false, 'Choose u by LIATE: Log, Inverse trig, Algebraic, Trig, Exponential.'),
  f('Integrals', 'Partial fractions (linear)', r`\frac{px+q}{(x-a)(x-b)} = \frac{A}{x-a} + \frac{B}{x-b}`, false),
  f('Integrals', 'Improper integral', r`\int_a^\infty f(x)\,dx = \lim_{b\to\infty}\int_a^b f(x)\,dx`, false, 'Write the limit — notation is graded.'),
  f('Integrals', 'Trapezoidal sum', r`T = \sum \frac{f(x_{i-1}) + f(x_i)}{2}\,\Delta x_i`, false, 'Works with unequal subintervals from a table.'),

  // Differential equations
  f('Differential equations', 'Exponential model', r`\frac{dy}{dt} = ky \;\Rightarrow\; y = y_0 e^{kt}`, false),
  f('Differential equations', 'Logistic model', r`\frac{dP}{dt} = kP\left(1 - \frac{P}{L}\right) \qquad \lim_{t\to\infty}P = L \qquad \text{fastest growth at } P = \frac{L}{2}`, false),
  f('Differential equations', 'Euler’s method', r`y_{n+1} = y_n + \left.\frac{dy}{dx}\right|_{(x_n,\,y_n)}\Delta x`, false),

  // Applications
  f('Applications', 'Linearization', r`L(x) = f(a) + f'(a)(x - a)`, false, 'Over/underestimate depends on concavity: concave up ⇒ tangent line underestimates.'),
  f('Applications', 'Motion: distance vs displacement', r`\text{displacement} = \int_a^b v(t)\,dt \qquad \text{distance} = \int_a^b |v(t)|\,dt`, false),
  f('Applications', 'Area between curves', r`A = \int_a^b \big(\text{top} - \text{bottom}\big)\,dx \qquad A = \int_c^d \big(\text{right} - \text{left}\big)\,dy`, false),
  f('Applications', 'Volume: discs & washers', r`V = \pi\int_a^b \left(R(x)^2 - r(x)^2\right)dx`, false, 'Measure R and r from the axis of rotation, not from the x-axis.'),
  f('Applications', 'Volume: known cross sections', r`V = \int_a^b A(x)\,dx \qquad \text{square: } s^2 \quad \text{semicircle: } \tfrac{\pi}{8}s^2 \qquad \text{equilateral triangle: } \tfrac{\sqrt3}{4}s^2`, false),
  f('Applications', 'Arc length (function)', r`L = \int_a^b \sqrt{1 + \left(f'(x)\right)^2}\,dx`, false),

  // Parametric / polar / vector
  f('Parametric, polar & vector', 'Parametric slope', r`\frac{dy}{dx} = \frac{dy/dt}{dx/dt}`, false),
  f('Parametric, polar & vector', 'Parametric second derivative', r`\frac{d^2y}{dx^2} = \frac{\frac{d}{dt}\!\left(\frac{dy}{dx}\right)}{dx/dt}`, false),
  f('Parametric, polar & vector', 'Parametric arc length / distance', r`L = \int_a^b \sqrt{\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2}\,dt`, false),
  f('Parametric, polar & vector', 'Speed', r`|\vec v(t)| = \sqrt{x'(t)^2 + y'(t)^2}`, false),
  f('Parametric, polar & vector', 'Polar conversion', r`x = r\cos\theta \qquad y = r\sin\theta \qquad r^2 = x^2 + y^2`, false, 'dy/dx in polar: differentiate x(θ) and y(θ) as parametric equations.'),
  f('Parametric, polar & vector', 'Polar area', r`A = \frac{1}{2}\int_\alpha^\beta r(\theta)^2\,d\theta`, false),

  // Series
  f('Series', 'Geometric series', r`\sum_{n=0}^{\infty} ar^n = \frac{a}{1-r} \quad (|r| < 1)`, false),
  f('Series', 'p-series', r`\sum_{n=1}^{\infty}\frac{1}{n^p} \text{ converges} \iff p > 1`, false, 'p = 1 is the harmonic series — diverges.'),
  f('Series', 'Ratio test', r`L = \lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right| \qquad L<1 \text{ converges (absolutely)},\ \ L>1 \text{ diverges} \qquad L=1 \text{ inconclusive}`, false),
  f('Series', 'Alternating series error bound', r`|S - S_n| \le |a_{n+1}|`, false, 'Requires terms decreasing in magnitude to 0.'),
  f('Series', 'Taylor series', r`f(x) = \sum_{n=0}^{\infty}\frac{f^{(n)}(a)}{n!}(x-a)^n`, false),
  f('Series', 'Lagrange error bound', r`|R_n(x)| \le \frac{\max\left|f^{(n+1)}(z)\right|}{(n+1)!}\,|x-a|^{n+1}`, false),
  f('Series', 'Maclaurin: eˣ', r`e^x = \sum_{n=0}^{\infty}\frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots`, false, 'Converges for all x.'),
  f('Series', 'Maclaurin: sin x and cos x', r`\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots \qquad \cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots`, false, 'Both converge for all x.'),
  f('Series', 'Maclaurin: 1/(1−x)', r`\frac{1}{1-x} = \sum_{n=0}^{\infty} x^n = 1 + x + x^2 + \cdots \quad (|x|<1)`, false),
  f('Series', 'Maclaurin: ln(1+x)', r`\ln(1+x) = x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots \quad (-1 < x \le 1)`, false),
  f('Series', 'Maclaurin: arctan x', r`\arctan x = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots \quad (|x| \le 1)`, false),
];
