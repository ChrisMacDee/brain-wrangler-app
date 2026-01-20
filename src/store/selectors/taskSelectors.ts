import type { AppStore } from '../index';
import { TaskStatus } from '../../types';

// Task selectors for optimized re-renders
export const selectAllTasks = (state: AppStore) => state.tasks;

export const selectPendingTasks = (state: AppStore) =>
  state.tasks.filter((task) => task.status === TaskStatus.PENDING);

export const selectInProgressTasks = (state: AppStore) =>
  state.tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS);

export const selectCompletedTasks = (state: AppStore) =>
  state.tasks.filter((task) => task.status === TaskStatus.COMPLETED);

export const selectActiveTasks = (state: AppStore) =>
  state.tasks.filter((task) => task.status !== TaskStatus.COMPLETED);

export const selectTaskById = (id: string) => (state: AppStore) =>
  state.tasks.find((task) => task.id === id);

export const selectCurrentTask = (state: AppStore) => {
  if (!state.currentTaskId) return null;
  return state.tasks.find((task) => task.id === state.currentTaskId) || null;
};

export const selectTaskCount = (state: AppStore) => state.tasks.length;

export const selectCompletedTaskCount = (state: AppStore) =>
  state.tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
