import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../../types';
import { TaskStatus } from '../../types';

export interface TasksSlice {
  // State
  tasks: Task[];

  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'status' | 'completedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  incrementTaskPomodoro: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  getNextTask: () => Task | null;
}

export const createTasksSlice: StateCreator<
  TasksSlice,
  [['zustand/immer', never]],
  [],
  TasksSlice
> = (set, get) => ({
  // Initial State
  tasks: [],

  // Actions
  addTask: (taskData) =>
    set((state) => {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        createdAt: Date.now(),
        completedPomodoros: 0,
        status: TaskStatus.PENDING,
        completedAt: null,
      };
      state.tasks.push(newTask);
    }),

  updateTask: (id, updates) =>
    set((state) => {
      const index = state.tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updates };
      }
    }),

  deleteTask: (id) =>
    set((state) => {
      state.tasks = state.tasks.filter((t) => t.id !== id);
    }),

  completeTask: (id) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        task.status = TaskStatus.COMPLETED;
        task.completedAt = Date.now();
      }
    }),

  incrementTaskPomodoro: (id) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        task.completedPomodoros += 1;
        if (task.status === TaskStatus.PENDING) {
          task.status = TaskStatus.IN_PROGRESS;
        }
      }
    }),

  reorderTasks: (startIndex, endIndex) =>
    set((state) => {
      const [removed] = state.tasks.splice(startIndex, 1);
      state.tasks.splice(endIndex, 0, removed);
      // Update order values
      state.tasks.forEach((task, index) => {
        task.order = index;
      });
    }),

  getNextTask: () => {
    const { tasks } = get();
    // Return the first non-completed task in order
    return tasks.find((t) => t.status !== TaskStatus.COMPLETED) || null;
  },
});
