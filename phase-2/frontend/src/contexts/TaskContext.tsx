'use client';

import React, { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Task } from '@/types/task';

/**
 * Task state shape
 */
export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  optimisticSnapshot?: {
    tasks: Task[];
    timestamp: number;
  };
}

/**
 * Task actions for reducer (optimistic update pattern)
 */
export type TaskAction =
  | { type: 'FETCH_REQUEST' }
  | { type: 'FETCH_SUCCESS'; payload: Task[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_TASK_OPTIMISTIC'; payload: Task }
  | { type: 'ADD_TASK_CONFIRMED'; payload: Task }
  | { type: 'UPDATE_TASK_OPTIMISTIC'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK_OPTIMISTIC'; payload: string }
  | { type: 'REVERT_OPTIMISTIC'; payload: TaskState['optimisticSnapshot'] };

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

/**
 * Task reducer with optimistic updates
 */
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return { ...state, loading: false, tasks: action.payload };

    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_TASK_OPTIMISTIC':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
        optimisticSnapshot: { tasks: state.tasks, timestamp: Date.now() },
      };

    case 'ADD_TASK_CONFIRMED':
      if (!action.payload || !action.payload.id) {
        console.error('ADD_TASK_CONFIRMED: Invalid payload', action.payload);
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
        optimisticSnapshot: undefined,
      };

    case 'UPDATE_TASK_OPTIMISTIC':
      if (!action.payload || !action.payload.id) {
        console.error('UPDATE_TASK_OPTIMISTIC: Invalid payload', action.payload);
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, ...action.payload.updates }
            : t
        ),
        optimisticSnapshot: { tasks: state.tasks, timestamp: Date.now() },
      };

    case 'DELETE_TASK_OPTIMISTIC':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        optimisticSnapshot: { tasks: state.tasks, timestamp: Date.now() },
      };

    case 'REVERT_OPTIMISTIC':
      return {
        ...state,
        tasks: action.payload?.tasks ?? state.tasks,
        optimisticSnapshot: undefined,
      };

    default:
      return state;
  }
}

interface TaskContextValue {
  state: TaskState;
  dispatch: Dispatch<TaskAction>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

/**
 * TaskProvider component
 * Wraps components that need access to task state
 */
export function TaskProvider({
  children,
  initialTasks = [],
}: {
  children: ReactNode;
  initialTasks?: Task[];
}) {
  const [state, dispatch] = useReducer(taskReducer, {
    ...initialState,
    tasks: initialTasks,
  });

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

/**
 * Hook to access task context
 * Must be used within TaskProvider
 */
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
}
