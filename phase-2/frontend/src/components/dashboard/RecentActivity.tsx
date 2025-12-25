'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import type { Task } from '@/types/task';

interface RecentActivityProps {
  tasks: Task[];
}

export function RecentActivity({ tasks }: RecentActivityProps) {
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [tasks]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };
  
  const getActivityText = (task: Task) => {
    if (task.completed) {
      return `Completed '${task.title}'`;
    }
    return `Created '${task.title}'`;
  };
  
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {recentTasks.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
        ) : (
          recentTasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {getActivityText(task)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(task.updated_at || task.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

