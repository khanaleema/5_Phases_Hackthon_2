import { useCallback, useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { getApiClient } from '@/lib/api-client';
import { authClient } from '@/lib/auth';
import { getJWTToken } from '@/lib/get-jwt-token';
import { toast } from 'sonner';
import type { CreateTaskInput, UpdateTaskInput } from '@/types/task';

/**
 * Custom hook for task CRUD operations with optimistic updates
 *
 * Features:
 * - Fetch tasks from backend
 * - Create task with optimistic UI update
 * - Toggle completion with instant feedback
 * - Update task details
 * - Delete task with rollback on failure
 */
export function useTasks() {
  const { state, dispatch } = useTaskContext();
  const { data: session } = authClient.useSession();
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  
  // Fetch JWT token from Better Auth when session is available
  useEffect(() => {
    let mounted = true;
    
    if (session) {
      // Fetch JWT token from Better Auth
      getJWTToken().then(token => {
        if (mounted) {
          setJwtToken(token);
        }
      }).catch(() => {
        if (mounted) {
          setJwtToken(null);
        }
      });
    } else {
      setJwtToken(null);
    }
    
    return () => {
      mounted = false;
    };
  }, [session?.user?.id]); // Only re-fetch when user changes
  
  // Get JWT token for API requests
  // This function always returns the current jwtToken state
  const getToken = useCallback(() => {
    return jwtToken;
  }, [jwtToken]);
  
  const apiClient = getApiClient(getToken);
  
  // Update API client token getter whenever jwtToken changes
  useEffect(() => {
    apiClient.setTokenGetter(getToken);
  }, [apiClient, getToken]);
  
  // Auto-fetch tasks when token becomes available
  useEffect(() => {
    if (jwtToken && session?.user && state.tasks.length === 0 && !state.loading) {
      // Use a small delay to ensure token is fully set
      const timer = setTimeout(() => {
        fetchTasks();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtToken, session?.user?.id]); // Only depend on token and user

  const fetchTasks = useCallback(async () => {
    // Don't fetch if there's no session
    if (!session?.user) {
      console.log('No session available, skipping task fetch');
      return;
    }
    
    // Wait for JWT token if not available yet
    let token = jwtToken;
    
    console.log('fetchTasks called, jwtToken:', jwtToken ? 'exists' : 'null', 'session:', session ? 'exists' : 'null');
    
    if (!token && session) {
      console.log('Fetching JWT token...');
      try {
        // Fetch token if not available
        token = await getJWTToken();
        console.log('JWT token fetched:', token ? 'exists' : 'null');
        if (token) {
          setJwtToken(token);
          // Update the API client immediately with the fetched token
          // (useEffect will also update it, but this ensures it's available right away)
          apiClient.setTokenGetter(() => token);
        } else {
          // Token fetch returned null - might be a temporary issue or session not ready
          console.warn('JWT token fetch returned null, will retry later');
          // Don't show error toast here - might be temporary
          // The useEffect will retry when token becomes available
          return;
        }
      } catch (error) {
        console.error('Error fetching JWT token:', error);
        // Only show error if it's a real error, not just a null return
        dispatch({ type: 'FETCH_ERROR', payload: 'Failed to get authentication token' });
        return;
      }
    }
    
    if (!token) {
      // No token available - this is expected if session is still loading
      console.log('No token available for API call, will retry when token is ready');
      return;
    }
    
    // Ensure API client has the current token (in case state hasn't updated yet)
    apiClient.setTokenGetter(() => token);
    
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      console.log('Fetching tasks with token:', token.substring(0, 20) + '...');
      const tasks = await apiClient.fetchTasks();
      // Convert id from int to string (backend returns int, frontend expects string)
      const normalizedTasks = tasks.map((task: any) => ({
        ...task,
        id: String(task.id),
      }));
      dispatch({ type: 'FETCH_SUCCESS', payload: normalizedTasks });
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      
      // Extract error message properly
      let errorMessage = 'Failed to load tasks';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.detail) {
        errorMessage = error.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.status) {
        errorMessage = `Server error (${error.status})`;
      }
      
      console.error('Error details:', {
        message: errorMessage,
        status: error?.status,
        fullError: error,
      });
      
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, [dispatch, jwtToken, session, apiClient]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      // Try to get JWT token if not available
      let token = jwtToken;
      if (!token && session) {
        console.log('JWT token not available, fetching...');
        try {
          token = await getJWTToken();
          if (token) {
            setJwtToken(token);
            apiClient.setTokenGetter(() => token);
          }
        } catch (error) {
          console.error('Failed to fetch JWT token:', error);
        }
      }

      // Check if JWT token is available
      if (!token) {
        const errorMessage = 'No authentication token available. Please sign in again.';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Optimistic: Add temporary task with unique ID (timestamp + random)
      const tempTask = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: session?.user?.id || '',
        title: input.title,
        description: input.description ?? null,
        completed: false,
        due_date: input.due_date ?? null,
        due_date_end: input.due_date_end ?? null,
        priority: input.priority ?? null,
        category: input.category ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TASK_OPTIMISTIC', payload: tempTask });

      try {
        // Ensure API client has the latest token
        apiClient.setTokenGetter(() => token);
        
        const confirmedTask = await apiClient.createTask(input);
        console.log('Task creation response:', confirmedTask);
        
        // Handle different response formats
        let task = confirmedTask;
        if (confirmedTask && typeof confirmedTask === 'object' && 'data' in confirmedTask) {
          task = (confirmedTask as any).data;
        }
        
        // Check if task is valid and has id property
        if (!task || task.id === undefined || task.id === null) {
          console.error('Invalid task response:', confirmedTask);
          throw new Error('Invalid task response from server - missing id');
        }
        
        // Ensure id is string (backend returns int, frontend expects string)
        const taskWithStringId = {
          ...task,
          id: String(task.id),
        };
        dispatch({ type: 'ADD_TASK_CONFIRMED', payload: taskWithStringId });
        
        // Show success toast
        toast.success('🎉 Task created successfully!', {
          description: task.title,
          duration: 3000,
        });
        
        // Return task for popup
        return taskWithStringId;
      } catch (error: any) {
        console.error('Task creation error:', error);
        dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
        const errorMessage = error?.message || 'Failed to create task';
        toast.error(errorMessage);
        throw error;
      }
    },
    [dispatch, apiClient, session, state.optimisticSnapshot, jwtToken]
  );

  const toggleComplete = useCallback(
    async (taskId: string, completed: boolean) => {
      // Check if task ID is a temp ID (not yet confirmed by backend)
      if (taskId.startsWith('temp-')) {
        toast.warning('Task is still being created. Please wait a moment.');
        return;
      }

      // Try to get JWT token if not available
      let token = jwtToken;
      if (!token && session) {
        try {
          token = await getJWTToken();
          if (token) {
            setJwtToken(token);
            apiClient.setTokenGetter(() => token);
          }
        } catch (error) {
          console.error('Failed to fetch JWT token:', error);
        }
      }

      // Check if JWT token is available
      if (!token) {
        const errorMessage = 'No authentication token available. Please sign in again.';
        toast.error(errorMessage);
        return;
      }

      dispatch({
        type: 'UPDATE_TASK_OPTIMISTIC',
        payload: { id: taskId, updates: { completed: !completed } },
      });

      try {
        // Ensure API client has the latest token
        apiClient.setTokenGetter(() => token);
        
        const updatedTask = await apiClient.patchTaskStatus(taskId, !completed);
        // Ensure id is string (backend returns int, frontend expects string)
        if (updatedTask && updatedTask.id) {
          const taskWithStringId = {
            ...updatedTask,
            id: String(updatedTask.id),
          };
          // Update with confirmed task from server
          dispatch({ type: 'ADD_TASK_CONFIRMED', payload: taskWithStringId });
        }
      } catch (error: any) {
        dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
        const errorMessage = error?.message || 'Failed to update task status';
        toast.error(errorMessage);
        console.error('Failed to toggle task completion:', errorMessage);
      }
    },
    [dispatch, apiClient, state.optimisticSnapshot, jwtToken, session]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: UpdateTaskInput) => {
      // Check if task ID is a temp ID (not yet confirmed by backend)
      if (taskId.startsWith('temp-')) {
        const error = new Error('Task is still being created. Please wait a moment and try again.');
        toast.error(error.message);
        throw error;
      }

      // Try to get JWT token if not available
      let token = jwtToken;
      if (!token && session) {
        console.log('JWT token not available for update, fetching...');
        try {
          token = await getJWTToken();
          if (token) {
            setJwtToken(token);
            apiClient.setTokenGetter(() => token);
          }
        } catch (error) {
          console.error('Failed to fetch JWT token:', error);
        }
      }

      // Check if JWT token is available
      if (!token) {
        const errorMessage = 'No authentication token available. Please sign in again.';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      dispatch({ type: 'UPDATE_TASK_OPTIMISTIC', payload: { id: taskId, updates } });

      try {
        // Ensure API client has the latest token
        apiClient.setTokenGetter(() => token);
        
        const updatedTask = await apiClient.updateTask(taskId, updates);
        // Ensure id is string (backend returns int, frontend expects string)
        if (updatedTask && updatedTask.id) {
          const taskWithStringId = {
            ...updatedTask,
            id: String(updatedTask.id),
          };
          dispatch({ type: 'ADD_TASK_CONFIRMED', payload: taskWithStringId });
        }
        toast.success('Task updated successfully');
      } catch (error: any) {
        dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
        const errorMessage = error?.message || 'Failed to update task';
        toast.error(errorMessage);
        throw error;
      }
    },
    [dispatch, apiClient, state.optimisticSnapshot, jwtToken, session]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      // Try to get JWT token if not available
      let token = jwtToken;
      if (!token && session) {
        try {
          token = await getJWTToken();
          if (token) {
            setJwtToken(token);
            apiClient.setTokenGetter(() => token);
          }
        } catch (error) {
          console.error('Failed to fetch JWT token:', error);
        }
      }

      // Check if JWT token is available
      if (!token) {
        const errorMessage = 'No authentication token available. Please sign in again.';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      dispatch({ type: 'DELETE_TASK_OPTIMISTIC', payload: taskId });

      try {
        // Ensure API client has the latest token
        apiClient.setTokenGetter(() => token);
        
        await apiClient.deleteTask(taskId);
        toast.success('Task deleted successfully');
      } catch (error: any) {
        dispatch({ type: 'REVERT_OPTIMISTIC', payload: state.optimisticSnapshot });
        const errorMessage = error?.message || 'Failed to delete task';
        toast.error(errorMessage);
        throw error;
      }
    },
    [dispatch, apiClient, state.optimisticSnapshot, jwtToken, session]
  );

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    fetchTasks,
    createTask,
    toggleComplete,
    updateTask,
    deleteTask,
  };
}
