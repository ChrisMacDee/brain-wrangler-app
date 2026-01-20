import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { PomodoroEstimator } from './PomodoroEstimator';
import type { Task } from '../../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description: string; estimatedPomodoros: number }) => void;
  task?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

  const isEditing = !!task;

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setEstimatedPomodoros(task.estimatedPomodoros);
      } else {
        setTitle('');
        setDescription('');
        setEstimatedPomodoros(1);
      }
    }
  }, [isOpen, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      estimatedPomodoros: estimatedPomodoros || 1,
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-300 mb-2">
            Task Title <span className="text-rose-400">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to focus on?"
            autoFocus
            className="
              w-full px-4 py-3 rounded-lg text-white font-medium
              bg-gray-800 border border-gray-600
              placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
              transition-all duration-200
            "
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-300 mb-2">
            Description <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details, notes, or steps..."
            rows={3}
            className="
              w-full px-4 py-3 rounded-lg text-white
              bg-gray-800 border border-gray-600
              placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
              transition-all duration-200
              resize-none
            "
          />
        </div>

        {/* Pomodoro Estimator */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Estimated Pomodoros
          </label>
          <div className="flex justify-center bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <PomodoroEstimator
              value={estimatedPomodoros}
              onChange={setEstimatedPomodoros}
              max={8}
              size="lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="
              flex-1 px-4 py-3 rounded-lg font-medium
              bg-gray-700 hover:bg-gray-600 text-white
              transition-colors duration-200
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="
              flex-1 px-4 py-3 rounded-lg font-medium
              bg-rose-600 hover:bg-rose-700 text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            {isEditing ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TaskModal;
