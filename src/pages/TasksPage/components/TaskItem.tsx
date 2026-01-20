import { useState, useRef } from 'react';
import {
  ChevronDown,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Play,
} from 'lucide-react';
import type { Task } from '../../../types';
import { TaskStatus } from '../../../types';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

export function TaskItem({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipingDelete, setIsSwipingDelete] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  // Swipe handlers for delete
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    // Only allow left swipe (delete)
    if (diff > 0) {
      const offset = Math.min(diff, 100); // Max swipe distance
      setSwipeOffset(offset);
      setIsSwipingDelete(offset > 60);
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingDelete) {
      onDelete(task.id);
    }
    setSwipeOffset(0);
    setIsSwipingDelete(false);
    touchStartX.current = null;
  };

  // Pomodoro progress visualization
  const renderPomodoroProgress = () => {
    const total = task.estimatedPomodoros;
    const completed = task.completedPomodoros;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, index) => {
          const isFilled = index < completed;
          return (
            <div key={index} className="relative">
              {isFilled ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]"
                >
                  <ellipse cx="12" cy="14" rx="9" ry="8" />
                  <path d="M12 6 C12 4 14 2 16 3 C14 4 13 5 12 6" fill="#22c55e" />
                  <path d="M12 6 C10 5 8 4 7 3 C9 3.5 11 4.5 12 6" fill="#22c55e" />
                  <ellipse cx="9" cy="12" rx="1.5" ry="2" fill="rgba(255,255,255,0.2)" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4 text-gray-600"
                >
                  <ellipse cx="12" cy="14" rx="9" ry="8" />
                  <path d="M12 6 C12 4 14 2 16 3 C14 4 13 5 12 6" />
                  <path d="M12 6 C10 5 8 4 7 3 C9 3.5 11 4.5 12 6" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Status icon
  const renderStatusIcon = () => {
    if (isCompleted) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange?.(task.id, TaskStatus.PENDING);
          }}
          className="p-1 -ml-1"
          aria-label="Mark as incomplete"
        >
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </button>
      );
    }

    if (isInProgress) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange?.(task.id, TaskStatus.COMPLETED);
          }}
          className="p-1 -ml-1"
          aria-label="Mark as complete"
        >
          <Play className="w-6 h-6 text-amber-500 fill-amber-500" />
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange?.(task.id, TaskStatus.COMPLETED);
        }}
        className="p-1 -ml-1"
        aria-label="Mark as complete"
      >
        <Circle className="w-6 h-6 text-gray-500 hover:text-gray-400 transition-colors" />
      </button>
    );
  };

  // Status badge
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
          Completed
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
          In Progress
        </span>
      );
    }
    return null;
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete background */}
      <div
        className={`
          absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-4
          bg-gradient-to-l from-red-600 to-red-600/80
          transition-opacity duration-200
          ${swipeOffset > 0 ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <Trash2 className={`w-6 h-6 text-white transition-transform duration-200 ${isSwipingDelete ? 'scale-125' : ''}`} />
      </div>

      {/* Main card content */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
        className={`
          relative bg-gray-800 border rounded-xl
          transition-all duration-200
          ${isCompleted
            ? 'border-gray-700/50 opacity-60'
            : isInProgress
              ? 'border-amber-500/30 shadow-lg shadow-amber-500/5'
              : 'border-gray-700 hover:border-gray-600'
          }
        `}
      >
        {/* Clickable header area */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer p-4"
        >
          <div className="flex items-start gap-3">
            {/* Status icon */}
            {renderStatusIcon()}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`
                    font-medium text-base leading-tight
                    ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}
                  `}
                >
                  {task.title}
                </h3>

                {/* Expand/collapse indicator */}
                <ChevronDown
                  className={`
                    w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200
                    ${isExpanded ? 'rotate-180' : ''}
                  `}
                />
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-2">
                {/* Pomodoro progress */}
                {renderPomodoroProgress()}

                {/* Status badge */}
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable description area */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="px-4 pb-4 border-t border-gray-700/50">
            {/* Description */}
            {task.description && (
              <p className="mt-3 text-sm text-gray-400 whitespace-pre-wrap">
                {task.description}
              </p>
            )}

            {!task.description && (
              <p className="mt-3 text-sm text-gray-500 italic">
                No description
              </p>
            )}

            {/* Progress details */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>
                {task.completedPomodoros} of {task.estimatedPomodoros} pomodoros ({task.completedPomodoros * 25} min)
              </span>
              <span>
                Created {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
