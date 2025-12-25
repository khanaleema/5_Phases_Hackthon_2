'use client';

import { useState, useEffect } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Task } from '@/types/task';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const { updateTask } = useTasks();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDateStart, setDueDateStart] = useState(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
  const [dueDateEnd, setDueDateEnd] = useState((task as any).due_date_end ? new Date((task as any).due_date_end).toISOString().split('T')[0] : '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(task.priority || null);
  const [category, setCategory] = useState(task.category || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if task is still being created (has temp ID)
  const isTempTask = task.id.startsWith('temp-');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDateStart(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
    setDueDateEnd((task as any).due_date_end ? new Date((task as any).due_date_end).toISOString().split('T')[0] : '');
    setPriority(task.priority || null);
    setCategory(task.category || '');
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isTempTask) {
      setErrors({ title: 'Task is still being created. Please wait a moment.' });
      return;
    }

    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        title: title.trim(),
        description: description.trim() || null,
      };
      
      if (dueDateStart) {
        updateData.due_date = new Date(dueDateStart).toISOString();
      } else {
        updateData.due_date = null;
      }
      
      if (dueDateEnd) {
        updateData.due_date_end = new Date(dueDateEnd).toISOString();
      } else {
        updateData.due_date_end = null;
      }
      
      updateData.priority = priority;
      
      if (category.trim()) {
        updateData.category = category.trim();
      } else {
        updateData.category = null;
      }
      
      await updateTask(task.id, updateData);
      onClose();
    } catch (error) {
      // Error toast already shown by useTasks
      // Don't close modal on error so user can fix and retry
    } finally {
      setLoading(false);
    }
  };

  return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit Task
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update your task details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              placeholder="What needs to be done?"
              required
              autoFocus
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details, notes, or context..."
              rows={3}
              className="flex w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Start Date <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="date"
                value={dueDateStart}
                onChange={(e) => setDueDateStart(e.target.value)}
                className="flex w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                End Date <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="date"
                value={dueDateEnd}
                onChange={(e) => setDueDateEnd(e.target.value)}
                min={dueDateStart || undefined}
                className="flex w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Priority <span className="text-slate-400">(optional)</span>
              </label>
              <select
                value={priority || ''}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | null || null)}
                className="flex w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Category <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Work, Personal, Shopping"
                className="flex w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <Button 
              type="button" 
              onClick={onClose} 
              variant="secondary" 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              disabled={isTempTask}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isTempTask ? 'Task Creating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

