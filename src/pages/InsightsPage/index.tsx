import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useStore } from '../../store';
import {
  selectTotalPomodoros,
  selectTotalWorkMinutes,
  selectTodayPomodoros,
} from '../../store/selectors/insightSelectors';
import { TaskStatus } from '../../types';
import { TrendingUp, Clock, Target, Award, ChevronDown } from 'lucide-react';

type DateRange = 7 | 14 | 30;

export function InsightsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(7);

  const totalPomodoros = useStore(selectTotalPomodoros);
  const totalWorkMinutes = useStore(selectTotalWorkMinutes);
  const todayPomodoros = useStore(selectTodayPomodoros);
  const getDailyStats = useStore((state) => state.getDailyStats);
  const tasks = useStore((state) => state.tasks);

  const dailyStats = getDailyStats(dateRange);

  // Calculate completed tasks with accuracy
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED);
  const tasksWithAccuracy = completedTasks
    .filter((t) => t.completedPomodoros > 0)
    .map((t) => {
      const accuracy = Math.round((t.estimatedPomodoros / t.completedPomodoros) * 100);
      return {
        ...t,
        accuracy: Math.min(accuracy, 200), // Cap at 200%
        overUnder: t.completedPomodoros - t.estimatedPomodoros,
      };
    })
    .sort((a, b) => b.completedAt! - a.completedAt!)
    .slice(0, 5);

  // Calculate average accuracy
  const avgAccuracy =
    tasksWithAccuracy.length > 0
      ? Math.round(
          tasksWithAccuracy.reduce((sum, t) => sum + t.accuracy, 0) / tasksWithAccuracy.length
        )
      : 0;

  // Format chart data
  const chartData = dailyStats.map((stat) => ({
    date: stat.date.slice(5), // MM-DD
    pomodoros: stat.completedPomodoros,
    minutes: stat.totalWorkMinutes,
  }));

  // Format hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-4 pb-24 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Insights</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Today's Pomodoros */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-rose-400" />
            <span className="text-sm text-gray-400">Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{todayPomodoros}</p>
          <p className="text-xs text-gray-500">pomodoros</p>
        </div>

        {/* All Time Pomodoros */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-400">All Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalPomodoros}</p>
          <p className="text-xs text-gray-500">pomodoros</p>
        </div>

        {/* Total Focus Time */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Focus Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatTime(totalWorkMinutes)}</p>
          <p className="text-xs text-gray-500">total</p>
        </div>

        {/* Estimate Accuracy */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-400">Accuracy</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {avgAccuracy > 0 ? `${avgAccuracy}%` : '—'}
          </p>
          <p className="text-xs text-gray-500">avg estimate</p>
        </div>
      </div>

      {/* Pomodoro Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Daily Pomodoros</h3>

          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value) as DateRange)}
              className="
                appearance-none bg-gray-700 border border-gray-600 rounded-lg
                pl-3 pr-8 py-1.5 text-sm text-white
                focus:outline-none focus:ring-2 focus:ring-rose-500
              "
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {chartData.some((d) => d.pomodoros > 0) ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={{ stroke: '#374151' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [`${value} pomodoros`, 'Completed']}
                />
                <Bar dataKey="pomodoros" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pomodoros > 0 ? '#f43f5e' : '#374151'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No data yet</p>
              <p className="text-sm">Complete pomodoros to see your progress</p>
            </div>
          </div>
        )}
      </div>

      {/* Estimate Accuracy Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <h3 className="font-semibold text-white mb-4">Estimate Accuracy</h3>

        {tasksWithAccuracy.length > 0 ? (
          <div className="space-y-3">
            {tasksWithAccuracy.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-gray-500">
                      Est: {task.estimatedPomodoros}
                    </span>
                    <span className="text-gray-600">→</span>
                    <span className="text-gray-500">
                      Actual: {task.completedPomodoros}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`
                      text-lg font-bold
                      ${task.accuracy >= 80 && task.accuracy <= 120
                        ? 'text-emerald-400'
                        : task.accuracy < 80
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    `}
                  >
                    {task.accuracy}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {task.overUnder > 0
                      ? `+${task.overUnder} over`
                      : task.overUnder < 0
                        ? `${Math.abs(task.overUnder)} under`
                        : 'Exact!'}
                  </span>
                </div>
              </div>
            ))}

            <p className="text-xs text-gray-500 text-center pt-2">
              80-120% = Good estimate • Below = Underestimated • Above = Overestimated
            </p>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No completed tasks yet</p>
            <p className="text-sm">Complete tasks to see your estimation accuracy</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsightsPage;
