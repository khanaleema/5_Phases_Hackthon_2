'use client';

import { useMemo } from 'react';
import { TrendingUp, Clock, Target, Calendar, Award, Zap, Activity, BarChart3 } from 'lucide-react';
import type { Task } from '@/types/task';

interface AnalyticsProps {
  tasks: Task[];
}

export function Analytics({ tasks }: AnalyticsProps) {
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    // Calculate average completion time (for completed tasks)
    const completedTasks = tasks.filter(t => t.completed && t.created_at && t.updated_at);
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => {
          const created = new Date(task.created_at!).getTime();
          const updated = new Date(task.updated_at!).getTime();
          return sum + (updated - created);
        }, 0) / completedTasks.length
      : 0;
    
    const avgHours = Math.round(avgCompletionTime / (1000 * 60 * 60));
    const avgDays = Math.round(avgCompletionTime / (1000 * 60 * 60 * 24));
    const avgTimeDisplay = avgDays > 0 ? `${avgDays}d` : avgHours > 0 ? `${avgHours}h` : 'N/A';
    
    // Calculate productivity score (0-100)
    const productivityScore = total > 0 
      ? Math.round((completed / total) * 100)
      : 0;
    
    // Calculate this week's stats
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekCompleted = tasks.filter(task => {
      if (!task.completed || !task.updated_at) return false;
      const taskDate = new Date(task.updated_at);
      return taskDate >= weekStart;
    }).length;
    
    const thisWeekCreated = tasks.filter(task => {
      if (!task.created_at) return false;
      const taskDate = new Date(task.created_at);
      return taskDate >= weekStart;
    }).length;
    
    // Calculate this month's stats
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCompleted = tasks.filter(task => {
      if (!task.completed || !task.updated_at) return false;
      const taskDate = new Date(task.updated_at);
      return taskDate >= monthStart;
    }).length;
    
    const thisMonthCreated = tasks.filter(task => {
      if (!task.created_at) return false;
      const taskDate = new Date(task.created_at);
      return taskDate >= monthStart;
    }).length;
    
    // Calculate streak (consecutive days with at least one completed task)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      checkDate.setHours(23, 59, 59, 999);
      
      const hasCompleted = tasks.some(task => {
        if (!task.completed || !task.updated_at) return false;
        const taskDate = new Date(task.updated_at);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === checkDate.getTime();
      });
      
      if (hasCompleted) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    // Calculate completion rate for this week
    const weekCompletionRate = thisWeekCreated > 0 
      ? Math.round((thisWeekCompleted / thisWeekCreated) * 100)
      : 0;
    
    // Calculate best day (most tasks completed in a single day)
    const dayCounts: { [key: string]: number } = {};
    tasks.forEach(task => {
      if (task.completed && task.updated_at) {
        const date = new Date(task.updated_at).toDateString();
        dayCounts[date] = (dayCounts[date] || 0) + 1;
      }
    });
    const bestDayCount = Math.max(...Object.values(dayCounts), 0);
    
    return {
      productivityScore,
      avgTimeDisplay,
      thisWeekCompleted,
      thisWeekCreated,
      thisMonthCompleted,
      thisMonthCreated,
      weekCompletionRate,
      streak,
      bestDayCount,
      total,
      completed,
      pending,
    };
  }, [tasks]);
  
  const mainStats = [
    {
      title: 'Productivity Score',
      value: `${analytics.productivityScore}%`,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
      description: 'Overall completion rate',
      trend: analytics.productivityScore >= 70 ? 'Excellent' : analytics.productivityScore >= 50 ? 'Good' : 'Needs improvement',
    },
    {
      title: 'This Week',
      value: `${analytics.thisWeekCompleted}`,
      icon: Calendar,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
      description: `${analytics.thisWeekCreated} created • ${analytics.weekCompletionRate}% completion`,
      trend: analytics.thisWeekCompleted > 0 ? `${analytics.weekCompletionRate}% rate` : 'No activity',
    },
    {
      title: 'Current Streak',
      value: `${analytics.streak}`,
      icon: Award,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950',
      description: 'Consecutive active days',
      trend: analytics.streak > 7 ? '🔥 On fire!' : analytics.streak > 0 ? 'Keep it up!' : 'Start your streak',
    },
  ];
  
  const secondaryStats = [
    {
      title: 'Avg Completion',
      value: analytics.avgTimeDisplay,
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'This Month',
      value: `${analytics.thisMonthCompleted}`,
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      title: 'Best Day',
      value: `${analytics.bestDayCount}`,
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
  ];
  
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Performance Analytics
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your productivity and progress
          </p>
        </div>
      </div>
      
      {/* Main Stats - Large Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`relative p-6 rounded-xl bg-gradient-to-br ${stat.bgGradient} border border-slate-200 dark:border-zinc-800 overflow-hidden group hover:shadow-xl transition-all duration-300`}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {stat.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  {stat.description}
                </p>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Secondary Stats - Smaller Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {secondaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl ${stat.bgColor} border border-slate-200 dark:border-zinc-800 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {stat.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
