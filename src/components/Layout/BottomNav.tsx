import { NavLink } from 'react-router-dom';
import { Timer, ListTodo, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { to: '/timer', icon: Timer, label: 'Timer' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className="bg-gray-800 border-t border-gray-700 px-1 py-1 safe-area-bottom">
      <ul className="flex justify-around items-center">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-red-500 bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-0.5">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
