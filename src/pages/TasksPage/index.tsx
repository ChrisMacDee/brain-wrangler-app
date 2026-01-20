import { useState } from 'react';
import { Plus, CheckCircle2, ListTodo, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { TaskStatus } from '../../types';
import type { Task } from '../../types';

export function TasksPage() {
  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);

  // Sort tasks: in-progress first, then pending, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = {
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.PENDING]: 1,
      [TaskStatus.COMPLETED]: 2,
    };
    const orderDiff = statusOrder[a.status] - statusOrder[b.status];
    if (orderDiff !== 0) return orderDiff;
    return a.order - b.order;
  });

  const activeTasks = sortedTasks.filter((t) => t.status !== TaskStatus.COMPLETED);
  const completedTasks = sortedTasks.filter((t) => t.status === TaskStatus.COMPLETED);
  const displayTasks = showCompleted ? sortedTasks : activeTasks;

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: { title: string; description: string; estimatedPomodoros: number }) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask({
        ...taskData,
        order: tasks.length,
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, {
      status,
      completedAt: status === TaskStatus.COMPLETED ? Date.now() : null,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Tasks</h2>

          {/* Toggle completed visibility */}
          {completedTasks.length > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white
                border border-gray-700 transition-colors
              "
            >
              {showCompleted ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide done
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show done ({completedTasks.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <ListTodo className="w-4 h-4" />
            <span>{activeTasks.length} active</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedTasks.length} completed</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {tasks.length === 0 ? 'No tasks yet' : 'All tasks completed!'}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              {tasks.length === 0
                ? 'Add your first task to start tracking your focus time.'
                : 'Great job! Add more tasks or take a well-deserved break.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB - Add Task */}
      <button
        onClick={handleAddTask}
        className="
          fixed bottom-20 right-4 z-40
          w-14 h-14 rounded-full
          bg-rose-600 hover:bg-rose-700 active:scale-95
          text-white shadow-lg shadow-rose-600/30
          flex items-center justify-center
          transition-all duration-200
        "
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}

export default TasksPage;
