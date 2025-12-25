'use client';

import { useMemo, useState } from 'react';
import type { Task } from '@/types/task';

interface TaskTrendsChartProps {
  tasks: Task[];
}

export function TaskTrendsChart({ tasks }: TaskTrendsChartProps) {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);
  
  // Calculate completion trends for last 6 weeks (completed and created)
  const weeklyData = useMemo(() => {
    const weeks: { week: string; completed: number; created: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekLabel = `W${6 - i}`;
      const completed = tasks.filter(task => {
        if (!task.completed || !task.updated_at) return false;
        const taskDate = new Date(task.updated_at);
        return taskDate >= weekStart && taskDate < weekEnd;
      }).length;
      
      const created = tasks.filter(task => {
        if (!task.created_at) return false;
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart && taskDate < weekEnd;
      }).length;
      
      weeks.push({ week: weekLabel, completed, created });
    }
    
    return weeks;
  }, [tasks]);
  
  const maxValue = Math.max(...weeklyData.flatMap(d => [d.completed, d.created]), 1);
  const chartHeight = 200;
  
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Completion Overview
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Created & completed trends
        </p>
      </div>
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <div className="flex items-end justify-between gap-2 h-full">
          {weeklyData.map((data, index) => {
            const completedHeight = maxValue > 0 ? (data.completed / maxValue) * (chartHeight - 40) : 0;
            const createdHeight = maxValue > 0 ? (data.created / maxValue) * (chartHeight - 40) : 0;
            const isHovered = hoveredWeek === data.week;
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center justify-end h-full"
                onMouseEnter={() => setHoveredWeek(data.week)}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                <div className="relative w-full flex items-end justify-center gap-1" style={{ height: `${chartHeight - 40}px` }}>
                  {isHovered && (data.completed > 0 || data.created > 0) && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg z-10">
                      {data.created} created, {data.completed} completed
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
                    </div>
                  )}
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
                      flex-1 bg-gradient-to-t from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 
                      rounded-t-lg transition-all duration-300 shadow-md
                      ${data.completed > 0 ? 'hover:from-green-700 hover:to-green-600 hover:scale-105 hover:shadow-lg' : 'opacity-50'}
                    `}
                    style={{ 
                      height: `${completedHeight}px`,
                      minHeight: data.completed > 0 ? '8px' : '0px'
                    }}
                  >
                    {data.completed > 0 && !isHovered && (
                      <div className="absolute -top-6 right-1/2 transform translate-x-1/2 text-xs font-semibold text-green-700 dark:text-green-300 whitespace-nowrap">
                        {data.completed}
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
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          <span className="text-slate-600 dark:text-slate-400">Completed</span>
        </div>
      </div>
    </div>
  );
}
