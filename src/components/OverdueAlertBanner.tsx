import React, { useState } from 'react';
import { Task } from '../types/todo';
import { AlertCircle, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, RefreshCw, X } from 'lucide-react';
import { getOverdueDurationString, getTodayString } from '../utils/date';
import { sounds } from '../utils/audio';

interface OverdueAlertBannerProps {
  overdueTasks: Task[];
  onRescheduleTask: (taskId: string, newDate: string) => void;
  onCompleteTask: (taskId: string) => void;
  onSelectTaskToEdit: (task: Task) => void;
}

export const OverdueAlertBanner: React.FC<OverdueAlertBannerProps> = ({
  overdueTasks,
  onRescheduleTask,
  onCompleteTask,
  onSelectTaskToEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (overdueTasks.length === 0 || dismissed) {
    return null;
  }

  const handleRescheduleAll = () => {
    sounds.playTick();
    const todayStr = getTodayString();
    overdueTasks.forEach((t) => onRescheduleTask(t.id, todayStr));
  };

  const handleComplete = (taskId: string) => {
    sounds.playTick();
    onCompleteTask(taskId);
  };

  return (
    <div className="relative mb-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/60 dark:border-amber-700/50 p-4 transition-all animate-fade-in shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Main gentle alert status */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Gentle Reminder: {overdueTasks.length} {overdueTasks.length === 1 ? 'task is' : 'tasks are'} overdue
              </h4>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                · Take your time, let's get back on track!
              </span>
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              {overdueTasks[0]?.title} {overdueTasks.length > 1 ? `and ${overdueTasks.length - 1} other items` : ''}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleRescheduleAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all active:scale-95"
            title="Move all overdue tasks to today"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reschedule for Today</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 rounded-lg transition-colors"
          >
            <span>{isExpanded ? 'Hide' : 'Review'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
            title="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded list of overdue tasks */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-amber-300/50 dark:border-amber-700/40 space-y-2">
          {overdueTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40"
            >
              <div 
                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                onClick={() => onSelectTaskToEdit(task)}
              >
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                  {task.title}
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-400 shrink-0">
                  · {getOverdueDurationString(task)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onRescheduleTask(task.id, getTodayString())}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  title="Reschedule to Today"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Today</span>
                </button>
                <button
                  onClick={() => handleComplete(task.id)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                  title="Mark Completed"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
