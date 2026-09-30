import React from 'react';
import { Task } from '../types/todo';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: (taskId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !task) return null;

  const handleDelete = () => {
    sounds.playDeleteSound();
    onConfirm(task.id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl shadow-2xl border border-rose-200/60 dark:border-rose-950/80 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Delete this task?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>

            <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                "{task.title}"
              </p>
              {task.subtasks && task.subtasks.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Contains {task.subtasks.length} subtask{task.subtasks.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
