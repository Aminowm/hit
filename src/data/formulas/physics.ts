import type { Formula } from '../../lib/types';
import { formulaFactory } from './factory';

const r = String.raw;

/**
 * AP Physics. `provided` = on the official AP equation sheet (allowed for the whole exam).
 * Items marked as not provided are results you should derive quickly or memorize.
 */
const p1 = formulaFactory('phys1');
export const PHYS1_FORMULAS: Formula[] = [
  p1('Kinematics', 'Constant-acceleration equations', r`v = v_0 + at \qquad x = x_0 + v_0 t + \tfrac12 a t^2 \qquad v^2 = v_0^2 + 2a(x - x_0)`, true),
  p1('Kinematics', 'Projectile: independent components', r`v_x = \text{const} \qquad a_y = -g`, false, 'Only time connects the horizontal and vertical motion.'),
  p1('Dynamics', 'Newton’s second law', r`\vec a = \frac{\sum \vec F}{m}`, true),
  p1('Dynamics', 'Friction', r`|F_f| \le \mu |F_N|`, true, 'Static: ≤ (only as large as needed). Kinetic: = μₖN.'),
  p1('Dynamics', 'Spring force (Hooke)', r`F_s = -k\,\Delta x`, true),
  p1('Dynamics', 'Universal gravitation', r`F_g = G\frac{m_1 m_2}{r^2}`, true),
  p1('Dynamics', 'Centripetal acceleration', r`a_c = \frac{v^2}{r} = \omega^2 r`, true),
  p1('Dynamics', 'Center of mass', r`x_{cm} = \frac{\sum m_i x_i}{\sum m_i}`, true),
  p1('Energy', 'Kinetic energy', r`K = \tfrac12 m v^2`, true),
  p1('Energy', 'Work', r`W = F_\parallel d = Fd\cos\theta`, true),
  p1('Energy', 'Potential energy', r`\Delta U_g = mg\Delta y \qquad U_s = \tfrac12 k\Delta x^2 \qquad U_G = -\frac{Gm_1m_2}{r}`, true),
  p1('Energy', 'Power', r`P = \frac{\Delta E}{\Delta t} = Fv\cos\theta`, true),
  p1('Momentum', 'Momentum & impulse', r`\vec p = m\vec v \qquad \vec J = \vec F_{avg}\Delta t = \Delta \vec p`, true),
  p1('Momentum', 'Conservation of momentum', r`\sum \vec p_i = \sum \vec p_f \qquad (\text{no net external impulse})`, false),
  p1('Rotation', 'Rotational kinematics', r`\omega = \omega_0 + \alpha t \qquad \theta = \theta_0 + \omega_0 t + \tfrac12\alpha t^2`, true),
  p1('Rotation', 'Linear ↔ angular', r`v = r\omega \qquad a_T = r\alpha`, true),
  p1('Rotation', 'Torque', r`\tau = rF\sin\theta = r_\perp F`, true),
  p1('Rotation', 'Rotational inertia', r`I = \sum m r^2 \qquad I' = I_{cm} + Md^2`, true),
  p1('Rotation', 'Newton’s 2nd law (rotation)', r`\alpha = \frac{\sum\tau}{I}`, true),
  p1('Rotation', 'Rotational KE & angular momentum', r`K = \tfrac12 I\omega^2 \qquad L = I\omega \qquad \Delta L = \tau\,\Delta t`, true),
  p1('Rotation', 'Rolling without slipping', r`v_{cm} = R\omega \qquad K = \tfrac12 Mv_{cm}^2 + \tfrac12 I\omega^2`, false),
  p1('Rotation', 'Circular orbit speed', r`v = \sqrt{\frac{GM}{r}}`, false, 'Derive in one line: GMm/r² = mv²/r.'),
  p1('Oscillations', 'Periods', r`T_s = 2\pi\sqrt{\frac{m}{k}} \qquad T_p = 2\pi\sqrt{\frac{\ell}{g}} \qquad T = \frac{1}{f}`, true),
  p1('Oscillations', 'SHM position', r`x = A\cos(2\pi f t)`, true),
  p1('Fluids', 'Density & pressure', r`\rho = \frac{m}{V} \qquad P = \frac{F}{A} \qquad P = P_0 + \rho g h`, true),
  p1('Fluids', 'Buoyant force', r`F_b = \rho_{\text{fluid}} V_{\text{displaced}}\, g`, true),
  p1('Fluids', 'Continuity', r`A_1 v_1 = A_2 v_2`, true),
  p1('Fluids', 'Bernoulli', r`P_1 + \rho g y_1 + \tfrac12\rho v_1^2 = P_2 + \rho g y_2 + \tfrac12\rho v_2^2`, true),
];

const pc = formulaFactory('physc');
export const PHYSC_FORMULAS: Formula[] = [
  pc('Calculus kinematics', 'Velocity & acceleration', r`v = \frac{dx}{dt} \qquad a = \frac{dv}{dt} = v\frac{dv}{dx}`, true, 'Use a = v dv/dx when force depends on position.'),
  pc('Calculus kinematics', 'Displacement from velocity', r`x(t) = x_0 + \int_0^t v(t')\,dt'`, false),
  pc('Dynamics', 'Newton’s second law (general)', r`\sum \vec F = \frac{d\vec p}{dt} = m\vec a`, true),
  pc('Dynamics', 'Linear drag', r`m\frac{dv}{dt} = mg - bv \qquad \Rightarrow\ v(t) = \frac{mg}{b}\left(1 - e^{-bt/m}\right)`, false, 'Terminal velocity v_T = mg/b, time constant τ = m/b. Practise this derivation.'),
  pc('Dynamics', 'Center of mass (continuous)', r`x_{cm} = \frac{\int x\,dm}{\int dm} \qquad dm = \lambda\,dx`, true),
  pc('Energy', 'Work (variable force)', r`W = \int_{x_1}^{x_2} \vec F \cdot d\vec r`, true),
  pc('Energy', 'Force from potential', r`F_x = -\frac{dU}{dx}`, true, 'Stable equilibrium at a minimum of U(x).'),
  pc('Energy', 'Power', r`P = \frac{dW}{dt} = \vec F \cdot \vec v`, true),
  pc('Energy', 'Gravitational potential energy', r`U_G = -\frac{GMm}{r}`, true),
  pc('Energy', 'Escape speed', r`v_{esc} = \sqrt{\frac{2GM}{R}}`, false, 'From ½mv² − GMm/R = 0.'),
  pc('Momentum', 'Impulse (variable force)', r`\vec J = \int \vec F\,dt = \Delta\vec p`, true),
  pc('Rotation', 'Rotational inertia (integral)', r`I = \int r^2\,dm \qquad I' = I_{cm} + Md^2`, true),
  pc('Rotation', 'Common moments of inertia', r`\text{rod (center)}\ \tfrac{1}{12}ML^2 \quad \text{rod (end)}\ \tfrac13 ML^2 \qquad \text{disk}\ \tfrac12 MR^2 \quad \text{hoop}\ MR^2 \quad \text{solid sphere}\ \tfrac25 MR^2`, false, 'Usually given in the problem — but knowing them saves time and catches errors.'),
  pc('Rotation', 'Torque & angular momentum (vector)', r`\vec\tau = \vec r \times \vec F \qquad \vec L = \vec r \times \vec p = I\vec\omega \qquad \sum\vec\tau = \frac{d\vec L}{dt}`, true),
  pc('Rotation', 'Rotational work', r`W = \int \tau\,d\theta`, false),
  pc('Oscillations', 'SHM differential equation', r`\frac{d^2x}{dt^2} = -\omega^2 x \qquad \Rightarrow\ x(t) = A\cos(\omega t + \phi)`, false, 'Get any system into this form and read off ω — the core Physics C oscillation skill.'),
  pc('Oscillations', 'Angular frequency', r`\omega = \sqrt{\frac{k}{m}} \qquad \omega = \sqrt{\frac{g}{\ell}}`, false),
  pc('Oscillations', 'Physical pendulum', r`T = 2\pi\sqrt{\frac{I}{mgd}}`, false, 'd = distance from pivot to center of mass.'),
  pc('Gravitation', 'Kepler’s third law (circular orbit)', r`T^2 = \frac{4\pi^2}{GM}\,r^3`, false),
];
