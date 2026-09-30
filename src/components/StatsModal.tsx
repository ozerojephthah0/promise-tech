import React from 'react';
import { Task, Category, ThemeId } from '../types/todo';
import { THEMES } from '../utils/theme';
import { getTodayString } from '../utils/date';
import {
  X,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  BarChart3,
  Sparkles,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: Category[];
  currentTheme: ThemeId;
  streak: number;
  onResetData: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  tasks,
  categories,
  currentTheme,
  streak,
  onResetData,
}) => {
  if (!isOpen) return null;

  const themeConfig = THEMES[currentTheme];
  const todayStr = getTodayString();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completedToday = tasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority counts
  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 midnight:bg-black rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${themeConfig.primaryLightClass}`}>
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Productivity Dashboard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track your task velocity, completion streaks, and focus metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Current Streak
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {completedTasks}
            </span>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Completed
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center">
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {completionRate}%
            </span>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Success Rate
            </p>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            Tasks by Priority
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40">
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">{urgentCount}</span>
              <p className="text-[10px] text-slate-400">Urgent</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">{highCount}</span>
              <p className="text-[10px] text-slate-400">High</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-900/40">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">{mediumCount}</span>
              <p className="text-[10px] text-slate-400">Medium</p>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 tabular-nums">{lowCount}</span>
              <p className="text-[10px] text-slate-400">Low</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            Category Distribution
          </h4>
          <div className="space-y-2">
            {categories
              .filter((c) => c.id !== 'all')
              .map((cat) => {
                const catTasks = tasks.filter((t) => t.categoryId === cat.id);
                const catCompleted = catTasks.filter((t) => t.completed).length;
                const catTotal = catTasks.length;
                const pct = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

                return (
                  <div key={cat.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-500 tabular-nums">
                        {catCompleted}/{catTotal} done ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Reset / Clean Up Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Reset to initial starter demo tasks?')) {
                sounds.playTick();
                onResetData();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Tasks</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all"
            style={{ backgroundColor: themeConfig.accentHex }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
