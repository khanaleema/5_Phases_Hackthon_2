'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Task } from '@/types/task';

interface LineChartProps {
  tasks: Task[];
}

type TimePeriod = 'weekly' | 'monthly';

export function LineChart({ tasks }: LineChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  
  // Calculate data for the selected time period
  const chartData = useMemo(() => {
    const now = new Date();
    const dataPoints: { 
      label: string; 
      created: number; 
      completed: number; 
      active: number;
      total: number;
    }[] = [];
    
    if (timePeriod === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        
        const dayLabel = date.toLocaleDateString('en-US', { day: '2-digit' });
        
        const created = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          return taskDate >= date && taskDate < nextDate;
        }).length;
        
        const completed = tasks.filter(task => {
          if (!task.completed || !task.updated_at) return false;
          const taskDate = new Date(task.updated_at);
          return taskDate >= date && taskDate < nextDate;
        }).length;
        
        const active = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          const isCreated = taskDate < nextDate;
          if (!task.completed) return isCreated;
          const completedDate = new Date(task.updated_at!);
          return isCreated && completedDate >= nextDate;
        }).length;
        
        const total = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          return taskDate < nextDate;
        }).length;
        
        dataPoints.push({
          label: dayLabel,
          created,
          completed,
          active,
          total,
        });
      }
    } else {
      // Last 7 weeks
      for (let i = 6; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        const weekLabel = `W${7 - i}`;
        
        const created = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          return taskDate >= weekStart && taskDate < weekEnd;
        }).length;
        
        const completed = tasks.filter(task => {
          if (!task.completed || !task.updated_at) return false;
          const taskDate = new Date(task.updated_at);
          return taskDate >= weekStart && taskDate < weekEnd;
        }).length;
        
        const active = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          const isCreated = taskDate < weekEnd;
          if (!task.completed) return isCreated;
          const completedDate = new Date(task.updated_at!);
          return isCreated && completedDate >= weekEnd;
        }).length;
        
        const total = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          return taskDate < weekEnd;
        }).length;
        
        dataPoints.push({
          label: weekLabel,
          created,
          completed,
          active,
          total,
        });
      }
    }
    
    return dataPoints;
  }, [tasks, timePeriod]);
  
  // Calculate max value for scaling
  const maxValue = Math.max(
    ...chartData.flatMap(d => [d.created, d.completed, d.active, d.total]),
    1
  );
  
  const chartHeight = 250;
  const chartWidth = '100%';
  
  // Line colors matching the image style
  const lineColors = {
    created: '#3b82f6', // Blue
    completed: '#a855f7', // Purple
    active: '#ec4899', // Pink
    total: '#10b981', // Green
  };
  
  // Calculate points for each line
  const getLinePath = (values: number[]) => {
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 90; // Leave 10% padding at top
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };
  
  const createdValues = chartData.map(d => d.created);
  const completedValues = chartData.map(d => d.completed);
  const activeValues = chartData.map(d => d.active);
  const totalValues = chartData.map(d => d.total);
  
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Task Trends
        </h3>
        <div className="relative">
          <button
            onClick={() => setTimePeriod(timePeriod === 'weekly' ? 'monthly' : 'weekly')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            {timePeriod === 'weekly' ? 'Weekly' : 'Monthly'}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg
          width={chartWidth}
          height={chartHeight}
          className="overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-slate-200 dark:text-zinc-700"
              opacity="0.5"
            />
          ))}
          
          {/* Created line (Blue) */}
          <path
            d={getLinePath(createdValues)}
            fill="none"
            stroke={lineColors.created}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          {createdValues.map((value, index) => {
            const x = (index / (createdValues.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 90;
            return (
              <circle
                key={`created-${index}`}
                cx={x}
                cy={y}
                r="1.5"
                fill={lineColors.created}
                className="drop-shadow-sm"
              />
            );
          })}
          
          {/* Completed line (Purple) */}
          <path
            d={getLinePath(completedValues)}
            fill="none"
            stroke={lineColors.completed}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          {completedValues.map((value, index) => {
            const x = (index / (completedValues.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 90;
            return (
              <circle
                key={`completed-${index}`}
                cx={x}
                cy={y}
                r="1.5"
                fill={lineColors.completed}
                className="drop-shadow-sm"
              />
            );
          })}
          
          {/* Active line (Pink) */}
          <path
            d={getLinePath(activeValues)}
            fill="none"
            stroke={lineColors.active}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          {activeValues.map((value, index) => {
            const x = (index / (activeValues.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 90;
            return (
              <circle
                key={`active-${index}`}
                cx={x}
                cy={y}
                r="1.5"
                fill={lineColors.active}
                className="drop-shadow-sm"
              />
            );
          })}
          
          {/* Total line (Green) */}
          <path
            d={getLinePath(totalValues)}
            fill="none"
            stroke={lineColors.total}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          {totalValues.map((value, index) => {
            const x = (index / (totalValues.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 90;
            return (
              <circle
                key={`total-${index}`}
                cx={x}
                cy={y}
                r="1.5"
                fill={lineColors.total}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {chartData.map((data, index) => (
            <span
              key={index}
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              {data.label}
            </span>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between pr-2">
          {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0].map((value, index) => (
            <span
              key={index}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              {value}
            </span>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lineColors.created }}></div>
          <span className="text-slate-600 dark:text-slate-400">Created</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lineColors.completed }}></div>
          <span className="text-slate-600 dark:text-slate-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lineColors.active }}></div>
          <span className="text-slate-600 dark:text-slate-400">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lineColors.total }}></div>
          <span className="text-slate-600 dark:text-slate-400">Total</span>
        </div>
      </div>
    </div>
  );
}

