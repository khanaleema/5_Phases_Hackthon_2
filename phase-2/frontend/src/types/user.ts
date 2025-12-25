/**
 * User entity type
 * Represents an authenticated user in the system
 */
export interface User {
  id: string;          // UUID from JWT sub claim
  email: string;       // User's email address
  createdAt: string;   // ISO 8601 timestamp
}
