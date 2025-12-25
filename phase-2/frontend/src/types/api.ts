/**
 * API response and error types
 * Standardized wrapper for all backend API responses
 */

/**
 * Generic API response wrapper
 * All backend endpoints return data in this format
 */
export interface ApiResponse<T> {
  data: T;                     // Response payload (typed generically)
  meta?: {                     // Optional metadata
    timestamp?: string;        // Server timestamp
    message?: string;          // Human-readable message
    pagination?: {             // Future: pagination info
      total: number;
      page: number;
      per_page: number;
    };
  };
}

/**
 * API error structure
 * Thrown by ApiClient when requests fail
 */
export interface ApiError {
  status: number;              // HTTP status code
  message: string;             // User-friendly error message
  details?: {                  // Optional validation errors
    field: string;
    message: string;
  }[];
}
