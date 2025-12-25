# API Contract: Tasks Endpoints

**Feature**: 002-frontend-web-app
**Date**: 2025-12-18
**Phase**: 1 (Design)
**Backend Base URL**: `http://localhost:8000` (development)

## Overview

This document defines the REST API contracts for task management operations. All endpoints follow the pattern `/api/{user_id}/tasks` to enforce user isolation per Constitution Section IV.

**Authentication**: All requests MUST include `Authorization: Bearer <jwt_token>` header.

---

## Common Headers

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Response Headers
```
Content-Type: application/json
X-Request-ID: <uuid>  (optional, for tracing)
```

---

## Endpoints

### 1. List All Tasks

**Description**: Retrieve all tasks for the authenticated user, sorted by creation date (newest first).

**Endpoint**: `GET /api/{user_id}/tasks`

**Path Parameters**:
- `user_id` (string, required): UUID of the authenticated user (extracted from JWT)

**Query Parameters**: None (filtering/pagination out of scope for MVP)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete project proposal",
      "description": "Finish writing the Q1 project proposal document",
      "completed": false,
      "created_at": "2025-12-18T14:30:00Z",
      "updated_at": "2025-12-18T14:30:00Z"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Buy groceries",
      "description": null,
      "completed": true,
      "created_at": "2025-12-17T10:15:00Z",
      "updated_at": "2025-12-18T09:20:00Z"
    }
  ],
  "meta": {
    "timestamp": "2025-12-18T15:00:00Z",
    "total": 2
  }
}
```

**Error Responses**:

- **401 Unauthorized** (missing or invalid JWT):
```json
{
  "detail": "Could not validate credentials"
}
```

- **403 Forbidden** (user_id mismatch):
```json
{
  "detail": "Access denied. User ID does not match authenticated user."
}
```

- **500 Internal Server Error**:
```json
{
  "detail": "Internal server error"
}
```

**Frontend Implementation**:
```typescript
// hooks/useTasks.ts
export async function fetchTasks(userId: string): Promise<Task[]> {
  const response = await apiClient.get<Task[]>(`/api/${userId}/tasks`);
  return response.data;
}
```

---

### 2. Create New Task

**Description**: Create a new task for the authenticated user.

**Endpoint**: `POST /api/{user_id}/tasks`

**Path Parameters**:
- `user_id` (string, required): UUID of the authenticated user

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Complete project proposal",
  "description": "Finish writing the Q1 project proposal document"
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters

**Success Response** (201 Created):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Complete project proposal",
    "description": "Finish writing the Q1 project proposal document",
    "completed": false,
    "created_at": "2025-12-18T14:30:00Z",
    "updated_at": "2025-12-18T14:30:00Z"
  },
  "meta": {
    "timestamp": "2025-12-18T14:30:00Z",
    "message": "Task created successfully"
  }
}
```

**Error Responses**:

- **400 Bad Request** (invalid JSON):
```json
{
  "detail": "Invalid JSON format"
}
```

- **422 Unprocessable Entity** (validation error):
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

- **401 Unauthorized**: (same as List All Tasks)

- **403 Forbidden**: (same as List All Tasks)

**Frontend Implementation**:
```typescript
// hooks/useTasks.ts
export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const validated = createTaskSchema.parse(input); // Zod validation
  const response = await apiClient.post<Task>(`/api/${userId}/tasks`, validated);
  return response.data;
}
```

---

### 3. Get Single Task

**Description**: Retrieve a specific task by ID.

**Endpoint**: `GET /api/{user_id}/tasks/{task_id}`

**Path Parameters**:
- `user_id` (string, required): UUID of the authenticated user
- `task_id` (string, required): UUID of the task

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Complete project proposal",
    "description": "Finish writing the Q1 project proposal document",
    "completed": false,
    "created_at": "2025-12-18T14:30:00Z",
    "updated_at": "2025-12-18T14:30:00Z"
  },
  "meta": {
    "timestamp": "2025-12-18T15:00:00Z"
  }
}
```

**Error Responses**:

- **404 Not Found** (task doesn't exist or doesn't belong to user):
```json
{
  "detail": "Task not found"
}
```

- **401 Unauthorized**: (same as above)

- **403 Forbidden**: (same as above)

**Frontend Implementation**:
```typescript
// hooks/useTasks.ts
export async function fetchTask(userId: string, taskId: string): Promise<Task> {
  const response = await apiClient.get<Task>(`/api/${userId}/tasks/${taskId}`);
  return response.data;
}
```

---

### 4. Update Task (Partial)

**Description**: Partially update a task (PATCH semantics). Only provided fields are updated.

**Endpoint**: `PATCH /api/{user_id}/tasks/{task_id}`

**Path Parameters**:
- `user_id` (string, required): UUID of the authenticated user
- `task_id` (string, required): UUID of the task

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated project proposal",
  "description": "New description",
  "completed": true
}
```

**Common Use Cases**:

1. Toggle completion only:
```json
{
  "completed": true
}
```

2. Edit title and description:
```json
{
  "title": "New title",
  "description": "New description"
}
```

3. Clear description:
```json
{
  "description": null
}
```

**Validation Rules**:
- `title`: If provided, 1-200 characters
- `description`: If provided, max 2000 characters (or null)
- `completed`: If provided, must be boolean

**Success Response** (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Updated project proposal",
    "description": "New description",
    "completed": true,
    "created_at": "2025-12-18T14:30:00Z",
    "updated_at": "2025-12-18T15:45:00Z"
  },
  "meta": {
    "timestamp": "2025-12-18T15:45:00Z",
    "message": "Task updated successfully"
  }
}
```

**Error Responses**:

- **422 Unprocessable Entity** (validation error):
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

- **404 Not Found**: (same as Get Single Task)

- **401 Unauthorized**: (same as above)

- **403 Forbidden**: (same as above)

**Frontend Implementation**:
```typescript
// hooks/useTasks.ts
export async function updateTask(
  userId: string,
  taskId: string,
  updates: UpdateTaskInput
): Promise<Task> {
  const validated = updateTaskSchema.parse(updates); // Zod validation
  const response = await apiClient.patch<Task>(`/api/${userId}/tasks/${taskId}`, validated);
  return response.data;
}

// Specialized helper for completion toggle
export async function toggleTaskCompletion(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<Task> {
  return updateTask(userId, taskId, { completed });
}
```

---

### 5. Update Task (Full Replacement)

**Description**: Replace entire task (PUT semantics). All fields except `id`, `user_id`, and timestamps must be provided.

**Note**: This endpoint is optional in MVP. PATCH is sufficient for all update use cases.

**Endpoint**: `PUT /api/{user_id}/tasks/{task_id}`

**Implementation**: Deferred to backend team if needed. Frontend will use PATCH exclusively.

---

### 6. Delete Task

**Description**: Permanently delete a task. This action cannot be undone.

**Endpoint**: `DELETE /api/{user_id}/tasks/{task_id}`

**Path Parameters**:
- `user_id` (string, required): UUID of the authenticated user
- `task_id` (string, required): UUID of the task

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Success Response** (204 No Content):
```
(Empty body)
```

**Alternative Success Response** (200 OK with message):
```json
{
  "data": null,
  "meta": {
    "timestamp": "2025-12-18T16:00:00Z",
    "message": "Task deleted successfully"
  }
}
```

**Error Responses**:

- **404 Not Found**: (same as Get Single Task)

- **401 Unauthorized**: (same as above)

- **403 Forbidden**: (same as above)

**Frontend Implementation**:
```typescript
// hooks/useTasks.ts
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await apiClient.delete(`/api/${userId}/tasks/${taskId}`);
}
```

---

## Error Handling Matrix

| Status Code | Condition | Frontend Action |
|-------------|-----------|-----------------|
| 200 | Success (GET, PATCH, PUT) | Update state with response data |
| 201 | Success (POST) | Add new task to state |
| 204 | Success (DELETE) | Remove task from state |
| 400 | Bad request (malformed JSON) | Show toast: "Invalid request format" |
| 401 | Unauthorized (missing/invalid JWT) | Redirect to `/signin` (silent) |
| 403 | Forbidden (user_id mismatch) | Show toast: "Access denied" |
| 404 | Not found (task doesn't exist) | Show toast: "Task not found. It may have been deleted." |
| 422 | Validation error | Show inline form errors from `detail` array |
| 500 | Server error | Show toast: "Server error. Please try again." |
| Network | Connection failed | Show toast: "Unable to connect. Check your internet connection." |

---

## Rate Limiting

**Policy**: Not implemented in MVP. Future consideration: 100 requests per minute per user.

**Headers** (future):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Authentication Flow

### JWT Token Acquisition

1. User signs in via Better Auth frontend
2. Better Auth calls backend auth endpoint
3. Backend verifies credentials and generates JWT
4. JWT stored in httpOnly cookie by Better Auth
5. Frontend extracts JWT from cookie for API calls

### JWT Claims Structure

```json
{
  "sub": "123e4567-e89b-12d3-a456-426614174000",  // user_id
  "email": "user@example.com",
  "exp": 1640000000,                              // expiration timestamp
  "iat": 1639990000                               // issued at timestamp
}
```

### User ID Extraction

```typescript
// lib/api-client.ts
import { jwtDecode } from 'jwt-decode';

export function getUserIdFromToken(token: string): string {
  const decoded = jwtDecode<{ sub: string }>(token);
  return decoded.sub;
}
```

---

## Request/Response Examples

### Example: Complete Task Creation Flow

**1. User submits form:**
```typescript
const input: CreateTaskInput = {
  title: "Buy groceries",
  description: "Milk, eggs, bread"
};
```

**2. Frontend validates:**
```typescript
const validated = createTaskSchema.parse(input); // Zod validation
// If invalid, show inline errors and return early
```

**3. Frontend sends request:**
```http
POST /api/123e4567-e89b-12d3-a456-426614174000/tasks HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**4. Backend validates user_id from JWT:**
```python
# Backend extracts user_id from JWT claims
jwt_user_id = token_payload["sub"]
path_user_id = request.path_params["user_id"]

if jwt_user_id != path_user_id:
    raise HTTPException(status_code=403, detail="Access denied")
```

**5. Backend creates task:**
```python
task = Task(
    id=uuid4(),
    user_id=jwt_user_id,
    title="Buy groceries",
    description="Milk, eggs, bread",
    completed=False,
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow()
)
db.add(task)
db.commit()
```

**6. Backend responds:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "data": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2025-12-18T16:30:00Z",
    "updated_at": "2025-12-18T16:30:00Z"
  },
  "meta": {
    "timestamp": "2025-12-18T16:30:00Z",
    "message": "Task created successfully"
  }
}
```

**7. Frontend updates state:**
```typescript
dispatch({ type: 'ADD_TASK_CONFIRMED', payload: response.data });
showToast({ type: 'success', message: 'Task created successfully' });
```

---

## Testing Checklist

### Happy Path Tests
- [ ] List tasks returns empty array for new user
- [ ] List tasks returns tasks sorted by created_at (newest first)
- [ ] Create task with title only (no description)
- [ ] Create task with title and description
- [ ] Get single task by ID
- [ ] Update task title
- [ ] Update task description
- [ ] Toggle task completion (false → true)
- [ ] Toggle task completion (true → false)
- [ ] Delete task

### Error Path Tests
- [ ] List tasks without JWT → 401
- [ ] List tasks with invalid JWT → 401
- [ ] List tasks with user_id mismatch → 403
- [ ] Create task without title → 422
- [ ] Create task with title > 200 chars → 422
- [ ] Create task with description > 2000 chars → 422
- [ ] Get non-existent task → 404
- [ ] Update non-existent task → 404
- [ ] Delete non-existent task → 404
- [ ] Update task owned by different user → 404 (not 403, to prevent user enumeration)

### Security Tests
- [ ] User A cannot access User B's tasks (via list endpoint)
- [ ] User A cannot get User B's task by ID
- [ ] User A cannot update User B's task
- [ ] User A cannot delete User B's task
- [ ] Expired JWT is rejected → 401
- [ ] Tampered JWT (invalid signature) is rejected → 401

---

## Backend Implementation Checklist

This contract defines the expected behavior. Backend team must implement:

- [ ] FastAPI router at `/api/{user_id}/tasks`
- [ ] JWT verification middleware (extract `user_id` from token)
- [ ] Path parameter validation (`user_id` matches JWT claim)
- [ ] SQLModel schema for Task entity
- [ ] CRUD service layer for task operations
- [ ] Pydantic request/response models
- [ ] Database queries with user_id filtering (data isolation)
- [ ] Error handling with standardized responses
- [ ] OpenAPI documentation (auto-generated by FastAPI)

---

## Next Steps

This API contract phase is complete. Proceed to:
1. Create `quickstart.md` for developer onboarding
2. Update agent context with API contract details
3. Begin implementation with backend-frontend integration tests
