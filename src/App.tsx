import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { TimerPage } from './pages/TimerPage';
import { TasksPage } from './pages/TasksPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/timer" replace />,
      },
      {
        path: 'timer',
        element: <TimerPage />,
      },
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      {
        path: 'insights',
        element: <InsightsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
], {
  basename: '/brain-wrangler-app',
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
