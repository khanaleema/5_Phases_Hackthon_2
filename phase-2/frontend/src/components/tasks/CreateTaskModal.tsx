'use client';

import { useState } from 'react';
import { X, Sparkles, Zap, Target, Lightbulb } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SuccessPopup } from './SuccessPopup';

interface CreateTaskModalProps {
  onClose: () => void;
}

const quickTemplates = [
  { icon: Zap, label: 'Quick Task', emoji: '⚡', color: 'bg-yellow-500' },
  { icon: Target, label: 'Goal', emoji: '🎯', color: 'bg-blue-500' },
  { icon: Lightbulb, label: 'Idea', emoji: '💡', color: 'bg-purple-500' },
  { icon: Sparkles, label: 'Reminder', emoji: '✨', color: 'bg-pink-500' },
];

export function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateStart, setDueDateStart] = useState('');
  const [dueDateEnd, setDueDateEnd] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | null>(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTaskTitle, setCreatedTaskTitle] = useState('');

  const handleTemplateClick = (template: typeof quickTemplates[0]) => {
    setSelectedTemplate(template.label);
    // Auto-fill with template-based title
    if (!title) {
      setTitle(`${template.emoji} ${template.label}...`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    setLoading(true);
    try {
      const taskData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
      };
      
      if (dueDateStart) {
        taskData.due_date = new Date(dueDateStart).toISOString();
      }
      
      if (dueDateEnd) {
        taskData.due_date_end = new Date(dueDateEnd).toISOString();
      }
      
      if (priority) {
        taskData.priority = priority;
      }
      
      if (category.trim()) {
        taskData.category = category.trim();
      }
      
      console.log('Creating task with:', taskData);
      const createdTask = await createTask(taskData);
      console.log('Task created successfully:', createdTask);
      
      // Show success popup
      if (createdTask) {
        setCreatedTaskTitle(createdTask.title);
        setShowSuccess(true);
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
          setTitle('');
          setDescription('');
          setDueDateStart('');
          setDueDateEnd('');
          setPriority(null);
          setCategory('');
          setSelectedTemplate(null);
        }, 500);
      } else {
        console.warn('Task created but no task object returned');
        onClose();
        setTitle('');
        setDescription('');
        setDueDateStart('');
        setDueDateEnd('');
        setPriority(null);
        setCategory('');
        setSelectedTemplate(null);
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      // Error toast already shown by useTasks, but show additional info if needed
      if (error?.message) {
        setErrors({ title: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Create New Task
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add a new task to stay organized
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

        {/* Quick Templates */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Quick Templates
          </p>
          <div className="grid grid-cols-4 gap-3">
            {quickTemplates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate === template.label;
              return (
                <button
                  key={template.label}
                  onClick={() => handleTemplateClick(template)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all transform hover:scale-105
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }
                  `}
                >
                  <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                    <span className="text-xl">{template.emoji}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {template.label}
                  </p>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-zinc-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Be specific and clear about what you want to accomplish
            </p>
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              {description.length}/2000 characters
            </p>
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

          {/* Action Buttons */}
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </form>
        </div>
      </div>
      
      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        taskTitle={createdTaskTitle}
      />
    </>
  );
}
