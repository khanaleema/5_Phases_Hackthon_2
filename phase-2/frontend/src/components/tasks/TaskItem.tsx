'use client';

import { useState } from 'react';
import { Check, Edit2, Trash2, Circle, Sparkles } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Task } from '@/types/task';
import { EditTaskModal } from './EditTaskModal';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleComplete, deleteTask } = useTasks();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Get task status (active/completed)
  const getTaskStatus = (): 'active' | 'completed' => {
    return task.completed ? 'completed' : 'active';
  };

  const status = getTaskStatus();

  const handleToggle = async () => {
    setIsToggling(true);
    await toggleComplete(task.id, task.completed);
    setTimeout(() => setIsToggling(false), 300);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <li className="group relative">
        <div             className={cn(
          "flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 border rounded-lg transition-all duration-300",
          task.completed
            ? "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10"
            : "border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700",
          "hover:shadow-lg transform hover:scale-[1.02]"
        )}>
          {/* Animated Checkbox */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={cn(
              'flex-shrink-0 w-6 h-6 mt-0.5 border-2 rounded-full flex items-center justify-center transition-all duration-300 transform',
              task.completed
                ? 'bg-green-600 border-green-600 scale-100 shadow-lg shadow-green-500/50'
                : 'border-slate-300 dark:border-zinc-700 hover:border-green-600 dark:hover:border-green-500 hover:scale-110',
              isToggling && 'animate-pulse'
            )}
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed ? (
              <div className="animate-in zoom-in duration-300">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : (
              <Circle className="w-4 h-4 text-transparent" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <h3
                className={cn(
                  'font-medium text-slate-900 dark:text-white transition-all duration-300',
                  task.completed && 'line-through text-slate-500 dark:text-slate-400'
                )}
              >
                {task.title}
              </h3>
              {task.completed && (
                <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5 animate-pulse" />
              )}
            </div>
            {task.description && (
              <p className={cn(
                'text-sm text-slate-600 dark:text-slate-400 mt-1 transition-all duration-300',
                task.completed && 'line-through text-slate-400 dark:text-zinc-600'
              )}>
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <p className="text-xs text-slate-500 dark:text-zinc-500">
                {formatRelativeTime(task.created_at)}
              </p>
              {task.due_date && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded',
                  new Date(task.due_date) < new Date() && !task.completed
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300'
                )}>
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
              {task.priority && (
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded',
                  task.priority === 'high' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                  task.priority === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                  task.priority === 'low' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                )}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
              {task.category && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {task.category}
                </span>
              )}
              {/* Status Badge */}
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                status === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              )}>
                {status === 'completed' ? (
                  <>
                    <Check className="w-3 h-3 inline mr-1" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-3 h-3 inline mr-1" />
                    Active
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Edit task"
            >
              <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-500" />
            </button>
          </div>
        </div>

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
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </li>

      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
