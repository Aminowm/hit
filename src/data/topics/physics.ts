import type { Course } from '../../lib/types';
import { unit } from './build';

/** AP Physics 1 — the redesigned 8-unit course (first exam May 2025). */
export const PHYS1_COURSE: Course = {
  exam: 'phys1',
  title: 'AP Physics 1: Algebra-Based',
  source: 'College Board · AP Physics 1 Course and Exam Description (2024 revision)',
  units: [
    unit('phys1', '1', 'Kinematics', [10, 15], [
      ['1.1', 'Scalars and vectors in one dimension'],
      ['1.2', 'Displacement, velocity and acceleration'],
      ['1.3', 'Representing motion (x–t, v–t, a–t graphs)', 'Slope of x–t is velocity; area under v–t is displacement.'],
      ['1.4', 'Reference frames and relative motion'],
      ['1.5', 'Vectors and motion in two dimensions (projectiles)', 'Horizontal and vertical motion are independent; only time links them.'],
    ]),
    unit('phys1', '2', 'Force and Translational Dynamics', [18, 23], [
      ['2.1', 'Systems and center of mass'],
      ['2.2', 'Forces and free-body diagrams', 'Draw the FBD first — on FRQs the diagram itself earns points.'],
      ['2.3', 'Newton’s third law'],
      ['2.4', 'Newton’s first law'],
      ['2.5', 'Newton’s second law'],
      ['2.6', 'Gravitational force'],
      ['2.7', 'Kinetic and static friction', 'Static friction is ≤ μₛN — it only takes the value it needs.'],
      ['2.8', 'Spring forces (Hooke’s law)'],
      ['2.9', 'Circular motion', 'There is no “centripetal force” on an FBD — it is the net of real forces.'],
    ]),
    unit('phys1', '3', 'Work, Energy, and Power', [18, 23], [
      ['3.1', 'Translational kinetic energy'],
      ['3.2', 'Work (force × displacement, area under F–x)'],
      ['3.3', 'Potential energy (gravitational, spring)'],
      ['3.4', 'Conservation of energy', 'Define the system explicitly — external work changes its total energy.'],
      ['3.5', 'Power'],
    ]),
    unit('phys1', '4', 'Linear Momentum', [10, 15], [
      ['4.1', 'Linear momentum'],
      ['4.2', 'Change in momentum and impulse', 'Impulse = area under F–t graph.'],
      ['4.3', 'Conservation of linear momentum'],
      ['4.4', 'Elastic and inelastic collisions', 'Momentum is conserved in all collisions; kinetic energy only in elastic ones.'],
    ]),
    unit('phys1', '5', 'Torque and Rotational Dynamics', [10, 15], [
      ['5.1', 'Rotational kinematics'],
      ['5.2', 'Connecting linear and rotational motion'],
      ['5.3', 'Torque'],
      ['5.4', 'Rotational inertia'],
      ['5.5', 'Rotational equilibrium and Newton’s first law in rotational form'],
      ['5.6', 'Newton’s second law in rotational form'],
    ]),
    unit('phys1', '6', 'Energy and Momentum of Rotating Systems', [5, 8], [
      ['6.1', 'Rotational kinetic energy'],
      ['6.2', 'Torque and work'],
      ['6.3', 'Angular momentum and angular impulse'],
      ['6.4', 'Conservation of angular momentum', 'Ice-skater: I decreases → ω increases; rotational KE is NOT conserved.'],
      ['6.5', 'Rolling without slipping', 'v = ωR; total KE = translational + rotational.'],
      ['6.6', 'Motion of orbiting satellites'],
    ]),
    unit('phys1', '7', 'Oscillations', [5, 8], [
      ['7.1', 'Defining simple harmonic motion'],
      ['7.2', 'Frequency and period of SHM', 'Pendulum period is independent of mass; spring period is independent of amplitude.'],
      ['7.3', 'Representing and analyzing SHM'],
      ['7.4', 'Energy of simple harmonic oscillators'],
    ]),
    unit('phys1', '8', 'Fluids', [10, 15], [
      ['8.1', 'Internal structure and density'],
      ['8.2', 'Pressure (absolute & gauge)'],
      ['8.3', 'Fluids and Newton’s laws (buoyancy)', 'Buoyant force = weight of DISPLACED fluid, not the object.'],
      ['8.4', 'Fluids and conservation laws (continuity, Bernoulli)'],
    ]),
  ],
};

/** AP Physics C: Mechanics — the 7-unit course (2024 revision). */
export const PHYSC_COURSE: Course = {
  exam: 'physc',
  title: 'AP Physics C: Mechanics',
  source: 'College Board · AP Physics C: Mechanics Course and Exam Description (2024 revision)',
  units: [
    unit('physc', '1', 'Kinematics', [10, 15], [
      ['1.1', 'Scalars and vectors in one dimension'],
      ['1.2', 'Displacement, velocity, acceleration as derivatives & integrals', 'v = dx/dt, a = dv/dt; for a(v) problems separate variables.'],
      ['1.3', 'Representing motion graphically'],
      ['1.4', 'Reference frames and relative motion'],
      ['1.5', 'Vectors and motion in two dimensions'],
    ]),
    unit('physc', '2', 'Force and Translational Dynamics', [20, 25], [
      ['2.1', 'Systems and center of mass (incl. continuous objects)', 'x_cm = (1/M)∫x dm with dm = λ dx for a rod.'],
      ['2.2', 'Forces and free-body diagrams'],
      ['2.3', 'Newton’s third law'],
      ['2.4', 'Newton’s first law'],
      ['2.5', 'Newton’s second law'],
      ['2.6', 'Gravitational force'],
      ['2.7', 'Kinetic and static friction'],
      ['2.8', 'Spring forces'],
      ['2.9', 'Resistive (drag) forces', 'Signature C problem: m dv/dt = mg − bv → terminal velocity mg/b, exponential approach.'],
      ['2.10', 'Circular motion'],
    ]),
    unit('physc', '3', 'Work, Energy, and Power', [15, 25], [
      ['3.1', 'Translational kinetic energy'],
      ['3.2', 'Work as ∫F·dx (variable forces)'],
      ['3.3', 'Potential energy and conservative forces', 'F = −dU/dx: equilibrium where U has a slope of zero; stable at a minimum.'],
      ['3.4', 'Conservation of energy'],
      ['3.5', 'Power (P = F·v)'],
    ]),
    unit('physc', '4', 'Linear Momentum', [10, 20], [
      ['4.1', 'Linear momentum'],
      ['4.2', 'Change in momentum and impulse (∫F dt)'],
      ['4.3', 'Conservation of linear momentum'],
      ['4.4', 'Elastic and inelastic collisions'],
    ]),
    unit('physc', '5', 'Torque and Rotational Dynamics', [10, 20], [
      ['5.1', 'Rotational kinematics'],
      ['5.2', 'Connecting linear and rotational motion'],
      ['5.3', 'Torque (τ = r × F)'],
      ['5.4', 'Rotational inertia by integration; parallel-axis theorem', 'I = ∫r² dm — practice rod (center & end), ring, disk.'],
      ['5.5', 'Rotational equilibrium'],
      ['5.6', 'Newton’s second law in rotational form'],
    ]),
    unit('physc', '6', 'Energy and Momentum of Rotating Systems', [10, 15], [
      ['6.1', 'Rotational kinetic energy'],
      ['6.2', 'Torque and work (∫τ dθ)'],
      ['6.3', 'Angular momentum and angular impulse'],
      ['6.4', 'Conservation of angular momentum'],
      ['6.5', 'Rolling (with and without slipping)'],
      ['6.6', 'Motion of orbiting satellites'],
    ]),
    unit('physc', '7', 'Oscillations', [10, 15], [
      ['7.1', 'Defining simple harmonic motion (d²x/dt² = −ω²x)', 'If you can write the equation in this form, ω is the square root of the coefficient.'],
      ['7.2', 'Frequency and period of SHM'],
      ['7.3', 'Representing and analyzing SHM'],
      ['7.4', 'Energy of simple harmonic oscillators'],
      ['7.5', 'Simple and physical pendulums', 'Physical pendulum: T = 2π√(I / mgd).'],
    ]),
  ],
};
