'use client';

import { useMemo, useState } from 'react';
import type { Task } from '@/types/task';

interface WeeklyActivityChartProps {
  tasks: Task[];
}

export function WeeklyActivityChart({ tasks }: WeeklyActivityChartProps) {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);
  
  // Calculate weekly activity (created, completed, active)
  const weeklyData = useMemo(() => {
    const weeks: { week: string; created: number; completed: number; active: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekLabel = `W${6 - i}`;
      const created = tasks.filter(task => {
        if (!task.created_at) return false;
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart && taskDate < weekEnd;
      }).length;
      
      const completed = tasks.filter(task => {
        if (!task.completed || !task.updated_at) return false;
        const taskDate = new Date(task.updated_at);
        return taskDate >= weekStart && taskDate < weekEnd && task.completed;
      }).length;
      
      // Active tasks: created before weekEnd but not completed, or completed after weekEnd
      const active = tasks.filter(task => {
        if (!task.created_at) return false;
        const taskCreated = new Date(task.created_at);
        if (taskCreated >= weekEnd) return false; // Not created yet
        
        if (!task.completed) return true; // Still active
        
        // Completed, but check if it was active during this week
        const taskCompleted = new Date(task.updated_at!);
        return taskCompleted >= weekEnd; // Was active during this week
      }).length;
      
      weeks.push({ week: weekLabel, created, completed, active });
    }
    
    return weeks;
  }, [tasks]);
  
  const maxValue = Math.max(...weeklyData.flatMap(d => [d.created, d.completed, d.active]), 1);
  const chartHeight = 200;
  
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Activity Breakdown
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Created, completed & active tasks
        </p>
      </div>
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <div className="flex items-end justify-between gap-2 h-full">
          {weeklyData.map((data, index) => {
            const createdHeight = maxValue > 0 ? (data.created / maxValue) * (chartHeight - 40) : 0;
            const completedHeight = maxValue > 0 ? (data.completed / maxValue) * (chartHeight - 40) : 0;
            const activeHeight = maxValue > 0 ? (data.active / maxValue) * (chartHeight - 40) : 0;
            const isHovered = hoveredWeek === data.week;
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center justify-end h-full"
                onMouseEnter={() => setHoveredWeek(data.week)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                {isHovered && (data.created > 0 || data.completed > 0 || data.active > 0) && (
                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg z-10">
                    {data.created} created, {data.completed} completed, {data.active} active
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
                  </div>
                )}
                <div className="relative w-full flex items-end justify-center gap-1" style={{ height: `${chartHeight - 40}px` }}>
                  <div
                    className={`
                      flex-1 bg-gradient-to-t from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 
                      rounded-t-lg transition-all duration-300 shadow-md
                      ${data.created > 0 ? 'hover:from-blue-700 hover:to-blue-600 hover:scale-105 hover:shadow-lg' : 'opacity-50'}
                    `}
                    style={{ 
                      height: `${createdHeight}px`,
                      minHeight: data.created > 0 ? '8px' : '0px'
                    }}
                  >
                    {data.created > 0 && !isHovered && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap">
                        {data.created}
                      </div>
                    )}
                  </div>
                  <div
                    className={`
                      flex-1 bg-gradient-to-t from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-400 
                      rounded-t-lg transition-all duration-300 shadow-md
                      ${data.completed > 0 ? 'hover:from-purple-700 hover:to-purple-600 hover:scale-105 hover:shadow-lg' : 'opacity-50'}
                    `}
                    style={{ 
                      height: `${completedHeight}px`,
                      minHeight: data.completed > 0 ? '8px' : '0px'
                    }}
                  >
                    {data.completed > 0 && !isHovered && (
                      <div className="absolute -top-6 right-1/2 transform translate-x-1/2 text-xs font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                        {data.completed}
                      </div>
                    )}
                  </div>
                  <div
                    className={`
                      flex-1 bg-gradient-to-t from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 
                      rounded-t-lg transition-all duration-300 shadow-md
                      ${data.active > 0 ? 'hover:from-red-700 hover:to-red-600 hover:scale-105 hover:shadow-lg' : 'opacity-50'}
                    `}
                    style={{ 
                      height: `${activeHeight}px`,
                      minHeight: data.active > 0 ? '8px' : '0px'
                    }}
                  >
                    {data.active > 0 && !isHovered && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-red-700 dark:text-red-300 whitespace-nowrap">
                        {data.active}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`mt-2 text-xs font-medium ${isHovered ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                  {data.week}
                </div>
              </div>
            );
          })}
        </div>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400 pr-2">
          <span>{maxValue}</span>
          <span>0</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Created</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-600 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Active</span>
        </div>
      </div>
    </div>
  );
}
