# Development Tasks: CLI Todo Application

## Feature Overview
Implementation of a command-line todo application that allows users to add, list, update, delete, and mark tasks complete/incomplete. The application follows the constitution constraints with Python 3.13+, in-memory storage, clean CLI interface, and modular architecture.

## Phase 1: Project Setup

- [X] T001 Create project directory structure with src/, tests/, and specs/ directories
- [X] T002 Set up pyproject.toml with project metadata and dependencies (Python 3.13+)
- [X] T003 Configure UV for dependency management
- [X] T004 Set up basic directory structure: src/models/, src/services/, src/cli/, src/lib/
- [X] T005 Create tests/unit/, tests/integration/, and tests/contract/ directories

## Phase 2: Foundational Components

- [X] T006 [P] Create Task data model in src/models/task.py with id, title, description, is_completed
- [X] T007 [P] Create in-memory store in src/lib/store.py with dictionary-based storage and ID generation
- [X] T008 [P] Create TaskService class skeleton in src/services/task_service.py with method signatures

## Phase 3: User Story 1 - Add New Tasks (Priority: P1)

- [X] T009 [US1] Implement TaskService.add_task() method with validation and unique ID assignment
- [X] T010 [US1] Create CLI command for adding tasks in src/cli/main.py
- [X] T011 [US1] Add error handling for empty title validation in add_task
- [X] T012 [P] [US1] Create unit tests for Task model validation
- [X] T013 [P] [US1] Create unit tests for add_task functionality
- [X] T014 [P] [US1] Create integration tests for CLI add command

## Phase 4: User Story 2 - List All Tasks (Priority: P1)

- [X] T015 [US2] Implement TaskService.get_all_tasks() method
- [X] T016 [US2] Create CLI command for listing tasks in src/cli/main.py
- [X] T017 [US2] Format task display with ID, title, description, and completion status
- [X] T018 [P] [US2] Create unit tests for get_all_tasks functionality
- [X] T019 [P] [US2] Create integration tests for CLI list command

## Phase 5: User Story 3 - Mark Tasks Complete/Incomplete (Priority: P2)

- [X] T020 [US3] Implement TaskService.mark_complete() method
- [X] T021 [US3] Implement TaskService.mark_incomplete() method
- [X] T022 [US3] Create CLI commands for complete and incomplete in src/cli/main.py
- [X] T023 [P] [US3] Create unit tests for mark_complete functionality
- [X] T024 [P] [US3] Create unit tests for mark_incomplete functionality
- [X] T025 [P] [US3] Create integration tests for CLI complete/incomplete commands

## Phase 6: User Story 4 - Update Task Details (Priority: P2)

- [X] T026 [US4] Implement TaskService.update_task() method with validation
- [X] T027 [US4] Create CLI command for updating tasks in src/cli/main.py
- [X] T028 [US4] Add error handling for non-existent task updates
- [X] T029 [P] [US4] Create unit tests for update_task functionality
- [X] T030 [P] [US4] Create integration tests for CLI update command

## Phase 7: User Story 5 - Delete Tasks (Priority: P2)

- [X] T031 [US5] Implement TaskService.delete_task() method
- [X] T032 [US5] Create CLI command for deleting tasks in src/cli/main.py
- [X] T033 [US5] Add error handling for non-existent task deletion
- [X] T034 [P] [US5] Create unit tests for delete_task functionality
- [X] T035 [P] [US5] Create integration tests for CLI delete command

## Phase 8: Error Handling and Edge Cases

- [X] T036 Implement error handling for invalid task IDs (negative numbers, non-numeric values)
- [X] T037 Add validation for title length (1-255 characters) and description length (max 1000)
- [X] T038 Create custom exception classes for better error messages
- [X] T039 Add proper error messages for all validation scenarios
- [X] T040 [P] Create unit tests for edge cases and error conditions

## Phase 9: CLI Enhancement and Help

- [X] T041 Implement help text for all available commands
- [X] T042 Add command-line argument validation and error messages
- [X] T043 Create proper CLI entry point with command routing
- [X] T044 [P] Create integration tests for help functionality

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T045 Add type hints to all public functions as required by constitution
- [ ] T046 Add basic docstrings to all public functions as required by constitution
- [ ] T047 Implement performance optimization for up to 1000 tasks in memory
- [ ] T048 Run all tests to ensure 100% functionality
- [ ] T049 Update README.md with setup and usage instructions
- [ ] T050 Create final integration tests covering all user stories together

## Dependencies Between User Stories

1. **US1 (Add)**: No dependencies - can be implemented independently as MVP
2. **US2 (List)**: Depends on US1 (needs tasks to list)
3. **US3 (Complete/Incomplete)**: No dependencies - can work with any task
4. **US4 (Update)**: No dependencies - can work with any task
5. **US5 (Delete)**: No dependencies - can work with any task

## Parallel Execution Opportunities

- **Models and Services**: Task model (T006) and Store (T007) can be developed in parallel
- **User Stories**: US3, US4, and US5 can be developed in parallel after US1
- **Tests**: Unit tests for each component can be developed in parallel with implementation
- **CLI Commands**: Multiple CLI commands can be implemented in parallel after core service methods exist

## Implementation Strategy

**MVP Scope**: Tasks T001-T014 (Project setup, foundational components, and Add/List functionality)
- Creates the basic application with ability to add and list tasks
- Provides immediate value and can be tested independently

**Incremental Delivery**: Each user story builds on the previous work but can be tested independently:
1. MVP: Add and List tasks
2. Add: Complete/Incomplete functionality
3. Add: Update functionality
4. Add: Delete functionality
5. Polish: Error handling, help, and documentation

## Independent Test Criteria

- **US1**: Can run `todo add "title" "desc"` and verify task appears in system
- **US2**: Can run `todo list` and see all added tasks with proper formatting
- **US3**: Can run `todo complete <id>` and see status change in list
- **US4**: Can run `todo update <id> "new title" "new desc"` and see changes in list
- **US5**: Can run `todo delete <id>` and verify task no longer appears in list