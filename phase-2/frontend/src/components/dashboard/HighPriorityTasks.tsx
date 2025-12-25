'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Task } from '@/types/task';

interface HighPriorityTasksProps {
  tasks: Task[];
  onCreateTask?: () => void;
}

export function HighPriorityTasks({ tasks, onCreateTask }: HighPriorityTasksProps) {
  // Get incomplete tasks (high priority = not completed)
  const highPriorityTasks = tasks.filter(task => !task.completed).slice(0, 5);
  
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          High Priority Tasks
        </h3>
        {onCreateTask && (
          <Button
            onClick={onCreateTask}
            size="sm"
            variant="ghost"
            className="p-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {highPriorityTasks.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No high priority tasks</p>
        ) : (
          highPriorityTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

