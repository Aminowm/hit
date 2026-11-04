import { lazy, Suspense, type ReactNode } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LibraryPage = lazy(() => import('./pages/Library'));
const Topics = lazy(() => import('./pages/Topics'));
const Formulas = lazy(() => import('./pages/Formulas'));
const Ielts = lazy(() => import('./pages/Ielts'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const Practice = lazy(() => import('./pages/Practice'));
const Mistakes = lazy(() => import('./pages/Mistakes'));
const Scores = lazy(() => import('./pages/Scores'));
const Planner = lazy(() => import('./pages/Planner'));
const TimerPage = lazy(() => import('./pages/Timer'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const page = (node: ReactNode) => (
  <Suspense fallback={<div className="py-24 text-center text-sm text-muted">Loading…</div>}>{node}</Suspense>
);

// Hash routing works on any static host (GitHub Pages included) with zero server config.
const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: page(<Dashboard />) },
      { path: 'library', element: page(<LibraryPage />) },
      { path: 'topics', element: page(<Topics />) },
      { path: 'topics/:exam', element: page(<Topics />) },
      { path: 'formulas', element: page(<Formulas />) },
      { path: 'ielts', element: page(<Ielts />) },
      { path: 'flashcards', element: page(<Flashcards />) },
      { path: 'practice', element: page(<Practice />) },
      { path: 'mistakes', element: page(<Mistakes />) },
      { path: 'scores', element: page(<Scores />) },
      { path: 'planner', element: page(<Planner />) },
      { path: 'timer', element: page(<TimerPage />) },
      { path: 'settings', element: page(<SettingsPage />) },
      { path: '*', element: page(<NotFound />) },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
