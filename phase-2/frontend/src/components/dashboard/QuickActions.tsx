'use client';

import { Plus, Calendar, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuickActionsProps {
  onCreateTask?: () => void;
  onViewCalendar?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export function QuickActions({ 
  onCreateTask, 
  onViewCalendar, 
  onExport, 
  onImport 
}: QuickActionsProps) {
  const actions = [
    {
      label: 'New Task',
      icon: Plus,
      onClick: onCreateTask,
      color: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
    },
    {
      label: 'Calendar',
      icon: Calendar,
      onClick: onViewCalendar,
      color: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700',
    },
    {
      label: 'Export',
      icon: Download,
      onClick: onExport,
      color: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700',
    },
    {
      label: 'Import',
      icon: Upload,
      onClick: onImport,
      color: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                ${action.color}
                p-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2
                shadow-sm hover:shadow-md transform hover:scale-105
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

