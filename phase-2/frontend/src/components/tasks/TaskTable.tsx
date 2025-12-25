'use client';

import { useState, useMemo } from 'react';
import { Check, Circle, Edit2, Trash2, Eye, Filter, ChevronLeft, ChevronRight, Search, Download, Upload, X } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Task } from '@/types/task';
import { EditTaskModal } from './EditTaskModal';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

type TaskFilter = 'all' | 'active' | 'completed';

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks: propTasks }: TaskTableProps) {
  const { tasks: contextTasks, toggleComplete, deleteTask, createTask } = useTasks();
  const tasks = propTasks || contextTasks;
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // Get task status (active/completed)
  const getTaskStatus = (task: Task): 'active' | 'completed' => {
    return task.completed ? 'completed' : 'active';
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Status filter
    switch (filter) {
      case 'active':
        result = result.filter(t => !t.completed);
        break;
      case 'completed':
        result = result.filter(t => t.completed);
        break;
      default:
        // 'all' - no filter
        break;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [tasks, filter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useState(() => {
    setCurrentPage(1);
  });

  // Select all tasks
  const handleSelectAll = () => {
    if (selectedTasks.size === paginatedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(paginatedTasks.map(t => t.id)));
    }
  };

  // Toggle task selection
  const handleToggleSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Bulk actions
  const handleBulkComplete = async () => {
    if (selectedTasks.size === 0) {
      toast.info('Please select tasks to complete');
      return;
    }
    for (const taskId of selectedTasks) {
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        await toggleComplete(taskId, false);
      }
    }
    setSelectedTasks(new Set());
    toast.success(`Marked ${selectedTasks.size} task(s) as completed`);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) {
      toast.info('Please select tasks to delete');
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedTasks.size} task(s)?`)) {
      for (const taskId of selectedTasks) {
        await deleteTask(taskId);
      }
      setSelectedTasks(new Set());
      toast.success(`Deleted ${selectedTasks.size} task(s)`);
    }
  };

  // Individual actions
  const handleEdit = (task: Task) => {
    // Don't allow editing temp tasks (still being created)
    if (task.id.startsWith('temp-')) {
      toast.warning('Task is still being created. Please wait a moment.');
      return;
    }
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleView = (task: Task) => {
    setViewingTask(task);
  };

  const handleDelete = (taskId: string) => {
    setDeletingTaskId(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingTaskId) {
      deleteTask(deletingTaskId);
      setShowDeleteConfirm(false);
      setDeletingTaskId(null);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = tasks.filter(t => !t.completed).length;
    return { total, completed, active };
  }, [tasks]);

  // Export tasks to JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredTasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Tasks exported successfully');
  };

  // Import tasks from JSON
  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedTasks = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedTasks)) {
            // Validate imported tasks
            const validTasks = importedTasks.filter(t => t.title && typeof t.title === 'string');
            if (validTasks.length === 0) {
              toast.error('No valid tasks found in file');
              return;
            }

            // Create tasks one by one with delay to avoid duplicate keys
            let successCount = 0;
            let errorCount = 0;

            toast.info(`Importing ${validTasks.length} task(s)...`);

            for (let i = 0; i < validTasks.length; i++) {
              const task = validTasks[i];
              try {
                // Add small delay between requests to avoid duplicate temp IDs and rate limiting
                if (i > 0) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                await createTask({
                  title: task.title,
                  description: task.description || undefined,
                });
                successCount++;
              } catch (error: any) {
                errorCount++;
                const errorMessage = error?.message || 'Unknown error';
                console.error('Failed to import task:', task.title, errorMessage);
                
                // If it's an auth error, stop the import
                if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
                  toast.error('Authentication error. Please sign in again.');
                  break;
                }
              }
            }

            if (successCount > 0) {
              toast.success(`Successfully imported ${successCount} task(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
            } else {
              toast.error(`Failed to import tasks. ${errorCount} error(s) occurred.`);
            }
          } else {
            toast.error('Invalid file format. Expected an array of tasks.');
          }
        } catch (error) {
          toast.error('Failed to parse JSON file');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Reset page when filter changes
  const handleFilterChange = (newFilter: TaskFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSelectedTasks(new Set());
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            {(['all', 'active', 'completed'] as TaskFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize',
                  filter === f
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                )}
              >
                {f} ({f === 'all' ? stats.total : f === 'active' ? stats.active : stats.completed})
              </button>
            ))}
          </div>

          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedTasks.size} selected
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBulkComplete}
              >
                Mark Complete
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                {paginatedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Circle className="w-12 h-12 text-slate-300 dark:text-zinc-700 mb-3" />
                        <p className="text-slate-600 dark:text-slate-400">
                          No {filter === 'all' ? '' : filter} tasks found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map((task) => {
                    const status = getTaskStatus(task);
                    return (
                      <tr
                        key={task.id}
                        className={cn(
                          'hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors',
                          selectedTasks.has(task.id) && 'bg-blue-50 dark:bg-blue-950/20',
                          task.completed && 'opacity-75'
                        )}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedTasks.has(task.id)}
                            onChange={() => handleToggleSelect(task.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleComplete(task.id, task.completed)}
                              className={cn(
                                'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all',
                                status === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              )}
                            >
                              {status === 'completed' ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Circle className="w-3 h-3" />
                                  Active
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-md">
                            <h3
                              className={cn(
                                'font-medium text-slate-900 dark:text-white',
                                task.completed && 'line-through text-slate-500 dark:text-slate-400'
                              )}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {task.due_date ? (
                            <span className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              new Date(task.due_date) < new Date() && !task.completed
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'
                            )}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {task.priority ? (
                            <span className={cn(
                              'px-2 py-1 rounded text-xs font-medium',
                              task.priority === 'high' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                              task.priority === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                              task.priority === 'low' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            )}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {task.category ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              {task.category}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {formatRelativeTime(task.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(task)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition"
                              title="View task"
                            >
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleEdit(task)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                              title="Edit task"
                            >
                              <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredTasks.length > tasksPerPage && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-t border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} task(s)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-2 rounded-lg transition',
                    currentPage === 1
                      ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-700 dark:text-slate-300 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'p-2 rounded-lg transition',
                    currentPage === totalPages
                      ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* View Modal */}
      {viewingTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setViewingTask(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Task Details
              </h2>
              <button
                onClick={() => setViewingTask(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                <span className="text-2xl text-slate-600 dark:text-slate-400">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                <div className="mt-1">
                  {(() => {
                    const status = getTaskStatus(viewingTask);
                    return (
                      <span
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
                          status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        )}
                      >
                        {status === 'completed' ? (
                          <>
                            <Check className="w-4 h-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4" />
                            Active
                          </>
                        )}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Title</label>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {viewingTask.title}
                </p>
              </div>
              {viewingTask.description && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
                  <p className="mt-1 text-slate-900 dark:text-white whitespace-pre-wrap">
                    {viewingTask.description}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {(viewingTask.due_date || (viewingTask as any).due_date_end) && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Due Date Range</label>
                    <p className={cn(
                      'mt-1 text-slate-900 dark:text-white',
                      viewingTask.due_date && new Date(viewingTask.due_date) < new Date() && !viewingTask.completed && 'text-red-600 dark:text-red-400 font-semibold'
                    )}>
                      {viewingTask.due_date ? new Date(viewingTask.due_date).toLocaleDateString() : '—'}
                      {(viewingTask as any).due_date_end && ` - ${new Date((viewingTask as any).due_date_end).toLocaleDateString()}`}
                    </p>
                  </div>
                )}
                {viewingTask.priority && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Priority</label>
                    <p className="mt-1">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        viewingTask.priority === 'high' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                        viewingTask.priority === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                        viewingTask.priority === 'low' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      )}>
                        {viewingTask.priority.charAt(0).toUpperCase() + viewingTask.priority.slice(1)}
                      </span>
                    </p>
                  </div>
                )}
                {viewingTask.category && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</label>
                    <p className="mt-1">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {viewingTask.category}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</label>
                  <p className="mt-1 text-slate-900 dark:text-white">
                    {new Date(viewingTask.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</label>
                  <p className="mt-1 text-slate-900 dark:text-white">
                    {new Date(viewingTask.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    toggleComplete(viewingTask.id, viewingTask.completed);
                    setViewingTask(null);
                  }}
                  className="flex-1"
                >
                  {viewingTask.completed ? 'Mark as Active' : 'Mark as Completed'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleEdit(viewingTask);
                    setViewingTask(null);
                  }}
                  className="flex-1"
                >
                  Edit Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete Task?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              This action cannot be undone. The task will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingTaskId(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
