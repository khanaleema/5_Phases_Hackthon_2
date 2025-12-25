'use client';

import { useEffect } from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
}

export function SuccessPopup({ isOpen, onClose, taskTitle }: SuccessPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl border border-green-400/50 p-4 backdrop-blur-sm transform transition-all hover:scale-105">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <h3 className="text-white font-bold text-lg">Task Created! 🎉</h3>
            </div>
            <p className="text-white/90 text-sm truncate font-medium">{taskTitle}</p>
            <p className="text-white/80 text-xs mt-1">Your task has been added successfully</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="h-1 bg-white/30 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-white/50 rounded-full animate-progress"
            style={{ animation: 'progress 3s linear forwards' }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
}
