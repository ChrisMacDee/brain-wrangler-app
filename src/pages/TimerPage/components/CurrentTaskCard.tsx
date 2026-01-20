import { useState } from 'react';
import { ChevronDown, CheckCircle2, X, ListTodo } from 'lucide-react';
import { useStore } from '../../../store';
import { TaskStatus } from '../../../types';
import type { Task } from '../../../types';

interface CurrentTaskCardProps {
  task: Task | null;
  onSelectTask: () => void;
  onCompleteTask: () => void;
  onClearTask: () => void;
}

export function CurrentTaskCard({
  task,
  onSelectTask,
  onCompleteTask,
  onClearTask,
}: CurrentTaskCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  if (!task) {
    return (
      <button
        onClick={onSelectTask}
        className="
          w-full max-w-sm mx-auto
          flex items-center justify-center gap-2 px-4 py-3
          bg-gray-800/50 hover:bg-gray-800 border border-gray-700 border-dashed
          rounded-xl text-gray-400 hover:text-gray-300
          transition-colors duration-200
        "
      >
        <ListTodo className="w-5 h-5" />
        <span className="font-medium">Assign a task</span>
      </button>
    );
  }

  // Render pomodoro progress
  const renderProgress = () => {
    const total = task.estimatedPomodoros;
    const completed = task.completedPomodoros;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < completed ? 'bg-rose-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Main card - clickable to expand */}
      <div
        onClick={() => task.description && setShowDescription(!showDescription)}
        className={`p-4 ${task.description ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-start gap-3">
          {/* Complete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompleteTask();
            }}
            className="mt-0.5 p-1 -ml-1 text-gray-400 hover:text-emerald-400 transition-colors"
            aria-label="Mark task as complete"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>

          {/* Task info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-white truncate">{task.title}</h4>
              {task.description && (
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
                    showDescription ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mt-2">
              {renderProgress()}
              <span className="text-xs text-gray-500">
                {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
            </div>
          </div>

          {/* Clear button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearTask();
            }}
            className="p-1 -mr-1 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Remove task from timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded description */}
      {showDescription && task.description && (
        <div className="px-4 pb-4 border-t border-gray-700/50">
          <p className="mt-3 text-sm text-gray-400 whitespace-pre-wrap">
            {task.description}
          </p>
        </div>
      )}
    </div>
  );
}

// Task Selector Modal/Dropdown
interface TaskSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
}

export function TaskSelector({ isOpen, onClose, onSelectTask }: TaskSelectorProps) {
  const tasks = useStore((state) => state.tasks);
  const availableTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETED);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative w-full sm:max-w-md max-h-[60vh]
          bg-gray-900 border border-gray-700
          rounded-t-2xl sm:rounded-2xl
          overflow-hidden flex flex-col
        "
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Select a Task</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {availableTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No tasks available</p>
              <p className="text-sm mt-1">Create a task first</p>
            </div>
          ) : (
            <div className="space-y-1">
              {availableTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    onSelectTask(task.id);
                    onClose();
                  }}
                  className="
                    w-full p-3 rounded-lg text-left
                    bg-gray-800/50 hover:bg-gray-800
                    border border-transparent hover:border-gray-600
                    transition-colors
                  "
                >
                  <div className="font-medium text-white">{task.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: task.estimatedPomodoros }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < task.completedPomodoros ? 'bg-rose-500' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
                    </span>
                    {task.status === TaskStatus.IN_PROGRESS && (
                      <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                        In progress
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CurrentTaskCard;
