import type { CreateTaskInput, Task, UpdateTaskInput } from '@/types/task';

/**
 * API Error type
 */
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * API Client for making authenticated requests to the backend
 *
 * Features:
 * - Automatic JWT token injection
 * - Centralized error handling
 * - Type-safe request/response handling
 */
class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  /**
   * Update the token getter function
   */
  setTokenGetter(getToken: () => string | null): void {
    this.getToken = getToken;
  }

  /**
   * Get current user ID from JWT token
   * Extracts user_id from JWT claims (sub or userId)
   */
  private get userId(): string {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub || payload.user_id || '';
    } catch {
      throw new Error('Invalid JWT token format');
    }
  }

  /**
   * Core request method with error handling
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const token = this.getToken();

    if (!token) {
      // Token might not be loaded yet, but we need it for API calls
      // The error will be shown to user
      throw new Error('No authentication token');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Inject JWT in Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Send cookies (for httpOnly auth-token)
      });

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          // Clear cached token to force refresh on next request
          if (typeof window !== 'undefined') {
            // Try to refresh token once before redirecting
            // This handles cases where token expired but session is still valid
            console.warn('401 Unauthorized - token may have expired');
            // Redirect to signin only if we're sure the session is invalid
            // Better Auth will handle session validation
            setTimeout(() => {
              window.location.href = '/signin';
            }, 100);
          }
          throw new Error('Unauthorized - please sign in again');
        }

        // Parse error response
        const error: ApiError = {
          status: response.status,
          message: response.statusText || `HTTP ${response.status}`,
        };

        try {
          const errorText = await response.text();
          if (errorText && errorText.trim()) {
            try {
              const errorData = JSON.parse(errorText);
              if (errorData && typeof errorData === 'object') {
                const hasKeys = Object.keys(errorData).length > 0;
                
                // Extract error message from various formats
                let errorMessage = errorData.message || errorData.detail;
                
                // Handle Pydantic validation errors
                if (errorData.detail && Array.isArray(errorData.detail)) {
                  const validationErrors = errorData.detail.map((err: any) => {
                    if (typeof err === 'object' && err.msg) {
                      return `${err.loc?.join('.') || 'field'}: ${err.msg}`;
                    }
                    return JSON.stringify(err);
                  }).join(', ');
                  errorMessage = validationErrors || errorMessage;
                } else if (errorData.detail && typeof errorData.detail === 'string') {
                  errorMessage = errorData.detail;
                }
                
                const hasMessage = errorMessage && typeof errorMessage === 'string' && errorMessage.trim().length > 0;
                
                if (hasKeys && hasMessage) {
                  // Only process if we have meaningful error data
                  error.message = errorMessage;
                  error.details = errorData.details || errorData.detail;
                  // Only log if we have actual error message (not empty object or empty string)
                  console.error('API Error Response:', {
                    message: errorMessage,
                    details: errorData.details || errorData.detail,
                  });
                } else {
                  // Empty object or no message, skip logging
                  error.message = errorText || response.statusText || `HTTP ${response.status}`;
                }
              } else {
                error.message = errorText;
              }
            } catch {
              // Not JSON, use text as message if it's not empty
              if (errorText.trim()) {
                error.message = errorText;
              }
            }
          }
        } catch (parseError) {
          // Can't read response, use statusText (already set)
        }

        // Only log if we have meaningful error info (skip empty objects and generic messages)
        const hasMeaningfulError = error.message && 
          typeof error.message === 'string' &&
          error.message !== `HTTP ${response.status}` && 
          error.message !== response.statusText &&
          error.message.trim().length > 0;
        
        if (hasMeaningfulError) {
          console.error('API Request Failed:', {
            url,
            status: response.status,
            message: error.message,
          });
        }

        throw error;
      }

      // Handle 204 No Content (e.g., DELETE responses)
      if (response.status === 204) {
        return { data: null as any };
      }

      const jsonData = await response.json();
      
      // If response is already wrapped in { data: ... }, return as is
      // Otherwise, wrap it for consistency
      if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
        return jsonData;
      }
      
      // For direct responses (like TaskResponse), wrap in { data: ... }
      return { data: jsonData };
    } catch (error) {
      // Network error (fetch failed)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          status: 0,
          message: 'Unable to connect. Check your internet connection.',
        } as ApiError;
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await this.request<T>(endpoint, { method: 'GET' });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * PUT request (full update)
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * PATCH request (partial update)
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<void> {
    await this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Fetch all tasks for the authenticated user
   * URL pattern: /api/{user_id}/tasks
   * Backend returns TaskListResponse with { data: Task[] }
   * API client's get() extracts response.data, so we get { data: Task[] } directly
   */
  async fetchTasks(): Promise<Task[]> {
    const response = await this.get<{ data: Task[] }>(`/api/${this.userId}/tasks`);
    // Backend returns { data: Task[] }, extract the inner data array
    if (Array.isArray(response)) {
      // If response is already an array (backward compatibility)
      return response;
    }
    return response?.data || [];
  }

  /**
   * Create a new task
   * URL pattern: POST /api/{user_id}/tasks
   * Backend returns TaskResponse directly (wrapped in { data: ... } by request method)
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await this.post<{ data: Task } | Task>(`/api/${this.userId}/tasks`, input);
    // Handle both wrapped and direct responses
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: Task }).data;
    }
    return response as Task;
  }

  /**
   * Update a task (title/description update)
   * URL pattern: PUT /api/{user_id}/tasks/{task_id}
   * Backend returns TaskResponse directly (wrapped in { data: ... } by request method)
   */
  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
    // PUT endpoint expects all task fields
    const { title, description, due_date, due_date_end, priority, category } = updates;
    if (!title) {
      throw new Error('Title is required for task update');
    }
    const updateData: any = { title, description };
    
    if (due_date !== undefined) {
      updateData.due_date = due_date;
    }
    if (due_date_end !== undefined) {
      updateData.due_date_end = due_date_end;
    }
    if (priority !== undefined) {
      updateData.priority = priority;
    }
    if (category !== undefined) {
      updateData.category = category;
    }
    
    const response = await this.put<{ data: Task } | Task>(`/api/${this.userId}/tasks/${taskId}`, updateData);
    // Handle both wrapped and direct responses
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: Task }).data;
    }
    return response as Task;
  }

  /**
   * Patch a task's completion status
   * URL pattern: PATCH /api/{user_id}/tasks/{task_id}
   * Backend returns TaskResponse directly (wrapped in { data: ... } by request method)
   */
  async patchTaskStatus(taskId: string, completed: boolean): Promise<Task> {
    // PATCH endpoint only accepts { completed: bool }
    const response = await this.patch<{ data: Task } | Task>(`/api/${this.userId}/tasks/${taskId}`, { completed });
    // Handle both wrapped and direct responses
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: Task }).data;
    }
    return response as Task;
  }

  /**
   * Delete a task
   * URL pattern: DELETE /api/{user_id}/tasks/{task_id}
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.delete(`/api/${this.userId}/tasks/${taskId}`);
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null;

/**
 * Get or create API client instance
 */
export function getApiClient(getToken: () => string | null): ApiClient {
  if (!apiClientInstance) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    apiClientInstance = new ApiClient(baseUrl, getToken);
  } else {
    // Update token getter if instance exists
    apiClientInstance.setTokenGetter(getToken);
  }
  return apiClientInstance;
}
