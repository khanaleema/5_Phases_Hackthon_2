'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TaskProvider, useTaskContext } from '@/contexts/TaskContext';
import { useTasks } from '@/hooks/useTasks';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';

function CalendarContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { state } = useTaskContext();
  const { tasks, loading, fetchTasks } = useTasks();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch tasks when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated && !loading) {
      fetchTasks();
    }
  }, [user?.id, isAuthenticated]);

  // Get tasks for a specific date (by created_at or updated_at)
  // Use tasks from useTasks hook (which includes fetched tasks) or fallback to context
  const allTasks = tasks.length > 0 ? tasks : (state.tasks || []);
  
  const getTasksForDate = (date: Date): Task[] => {
    if (!allTasks || allTasks.length === 0) return [];
    const dateStr = date.toISOString().split('T')[0];
    return allTasks.filter((task) => {
      if (!task.created_at) return false;
      const createdDate = new Date(task.created_at).toISOString().split('T')[0];
      const updatedDate = task.updated_at ? new Date(task.updated_at).toISOString().split('T')[0] : createdDate;
      return createdDate === dateStr || updatedDate === dateStr;
    });
  };

  // Get task count for a date
  const getTaskCountForDate = (date: Date): { total: number; completed: number; pending: number } => {
    const tasks = getTasksForDate(date);
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
    };
  };

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="lg:pl-64 min-h-screen">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Calendar
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View your tasks on a calendar
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </Button>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Calendar Header */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goToToday}
                >
                  Today
                </Button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const taskCount = getTaskCountForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const hasTasks = taskCount.total > 0;

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      'aspect-square p-2 rounded-lg border-2 transition-all hover:scale-105 relative',
                      isToday
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 shadow-md'
                        : isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-500 shadow-md'
                        : hasTasks
                        ? 'border-slate-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50 dark:bg-zinc-800/50'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    )}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={cn(
                          'text-sm font-medium mb-1',
                          isToday
                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-900 dark:text-white'
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {hasTasks && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-1">
                          <div className="flex gap-1 items-center">
                            {taskCount.pending > 0 && (
                              <div className="w-2 h-2 rounded-full bg-blue-500" title={`${taskCount.pending} pending`} />
                            )}
                            {taskCount.completed > 0 && (
                              <div className="w-2 h-2 rounded-full bg-green-500" title={`${taskCount.completed} completed`} />
                            )}
                          </div>
                          {taskCount.total > 2 && (
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                              {taskCount.total}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Tasks for {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
              {getTasksForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">
                    No tasks for this date
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Task
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {getTasksForDate(selectedDate).map((task) => (
                    <li
                      key={task.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        task.completed
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                          : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                            task.completed ? 'bg-green-500' : 'bg-blue-500'
                          )}
                        />
                        <div className="flex-1">
                          <h4
                            className={cn(
                              'font-medium',
                              task.completed
                                ? 'line-through text-slate-500 dark:text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            )}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <TaskProvider>
      <CalendarContent />
    </TaskProvider>
  );
}
