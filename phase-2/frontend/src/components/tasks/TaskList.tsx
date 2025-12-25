'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { TaskItem } from './TaskItem';
import { Loader2, CheckCircle2, Filter, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import type { Task } from '@/types/task';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type TaskFilter = 'all' | 'active' | 'completed';

interface TaskListProps {
  tasks?: Task[];
}

export function TaskList({ tasks: propTasks }: TaskListProps = {}) {
  const { tasks: contextTasks, loading, error, fetchTasks } = useTasks();
  const { user } = useAuth();
  const tasks = propTasks || contextTasks;
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    // Only fetch tasks when user is authenticated
    // This will be called when component mounts and user is available
    if (user && !loading && tasks.length === 0) {
      fetchTasks();
    }
  }, [user?.id]); // Only depend on user.id to avoid infinite loops

  // Get task status
  const getTaskStatus = (task: Task): 'active' | 'completed' => {
    return task.completed ? 'completed' : 'active';
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    switch (filter) {
      case 'active':
        result = result.filter(t => !t.completed);
        break;
      case 'completed':
        result = result.filter(t => t.completed);
        break;
      default:
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

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = tasks.filter(t => !t.completed).length;
    return { total, completed, active };
  }, [tasks]);

  const handleFilterChange = (newFilter: TaskFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSearchQuery('');
  };

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading your tasks...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Empty state
  if (filteredTasks.length === 0) {
    return (
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
          <div className="relative">
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
        </div>
        
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-slate-400 dark:text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No {filter === 'all' ? '' : filter} tasks found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-sm">
            {filter === 'all' 
              ? 'Create your first task to get started. Stay organized and boost your productivity!'
              : `No ${filter} tasks at the moment.`}
          </p>
        </div>
      </div>
    );
  }

  // Task list
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap p-4 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
        <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        {(['all', 'active', 'completed', 'inactive'] as TaskFilter[]).map((f) => (
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
            {f} ({f === 'all' ? stats.total : f === 'active' ? stats.active : f === 'completed' ? stats.completed : stats.inactive})
          </button>
        ))}
      </div>

      {/* Task List */}
      <ul className="space-y-2">
        {paginatedTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>

      {/* Pagination */}
      {filteredTasks.length > tasksPerPage && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800">
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
  );
}
