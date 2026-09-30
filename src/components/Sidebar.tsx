import React from 'react';
import { Category, FilterStatus, Task, ThemeId } from '../types/todo';
import { THEMES } from '../utils/theme';
import { getCategoryIcon } from '../utils/categoryIcons';
import { isTaskDueToday, isTaskOverdue, isTaskUpcoming } from '../utils/date';
import {
  Inbox,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Flame,
  Zap,
  Download,
  Upload,
  BarChart3,
  Timer
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  tasks: Task[];
  currentTheme: ThemeId;
  onOpenNewCategoryModal: () => void;
  onOpenFocusTimer: () => void;
  onOpenStats: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  activeFilter,
  onSelectFilter,
  tasks,
  currentTheme,
  onOpenNewCategoryModal,
  onOpenFocusTimer,
  onOpenStats,
  onExportData,
  onImportData,
}) => {
  const themeConfig = THEMES[currentTheme];

  // Calculate counts
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const todayTasks = tasks.filter((t) => !t.completed && isTaskDueToday(t)).length;
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t)).length;
  const upcomingTasks = tasks.filter((t) => !t.completed && isTaskUpcoming(t)).length;
  const urgentTasks = tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleFilterClick = (filter: FilterStatus) => {
    sounds.playTick();
    onSelectFilter(filter);
    onSelectCategory('all');
  };

  const handleCategoryClick = (catId: string) => {
    sounds.playTick();
    onSelectCategory(catId);
    onSelectFilter('all');
  };

  const navFilters: { id: FilterStatus; label: string; icon: React.FC<{ className?: string }>; count: number; countClass?: string }[] = [
    { id: 'all', label: 'All Tasks', icon: Inbox, count: pendingTasks },
    { id: 'today', label: 'Due Today', icon: Calendar, count: todayTasks },
    { id: 'overdue', label: 'Overdue', icon: Clock, count: overdueTasks, countClass: overdueTasks > 0 ? 'bg-amber-500 text-white font-bold' : undefined },
    { id: 'upcoming', label: 'Upcoming', icon: Zap, count: upcomingTasks },
    { id: 'urgent', label: 'High / Urgent', icon: AlertTriangle, count: urgentTasks, countClass: urgentTasks > 0 ? 'bg-rose-500 text-white' : undefined },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completedTasks },
  ];

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
      {/* Smart Filters Group */}
      <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Overview
          </span>
          <button
            onClick={onOpenStats}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>
        </div>

        <nav className="space-y-1">
          {navFilters.map((item) => {
            const IconComp = item.icon;
            const isActive = activeFilter === item.id && selectedCategoryId === 'all';
            return (
              <button
                key={item.id}
                onClick={() => handleFilterClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                style={{
                  backgroundColor: isActive ? themeConfig.accentHex : undefined,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-md tabular-nums ${
                    item.countClass || (isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400')
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Categories Group */}
      <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Categories
          </span>
          <button
            onClick={onOpenNewCategoryModal}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Create new category"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1">
          {categories.map((cat) => {
            const IconComp = getCategoryIcon(cat.icon);
            const count = tasks.filter(
              (t) => !t.completed && (cat.id === 'all' || t.categoryId === cat.id)
            ).length;
            const isCatActive = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isCatActive
                    ? 'border text-slate-900 dark:text-white font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                style={{
                  borderColor: isCatActive ? cat.color : 'transparent',
                  backgroundColor: isCatActive ? `${cat.color}15` : undefined,
                }}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <IconComp className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Focus & Productivity Widget */}
      <div className="bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Focus Sprint
            </span>
          </div>
          <button
            onClick={onOpenFocusTimer}
            className="px-2.5 py-1 text-[11px] font-semibold text-white rounded-lg shadow-xs transition-all active:scale-95"
            style={{ backgroundColor: themeConfig.accentHex }}
          >
            Launch Timer
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Progress</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionRate}%`,
                backgroundColor: themeConfig.accentHex,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>{completedTasks} completed</span>
            <span>{pendingTasks} remaining</span>
          </div>
        </div>
      </div>

      {/* Backup Export / Import */}
      <div className="flex items-center justify-between gap-2 px-2 text-xs text-slate-400">
        <button
          onClick={onExportData}
          className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Export task data as JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Backup</span>
        </button>

        <label className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span>Restore Backup</span>
          <input
            type="file"
            accept=".json"
            onChange={onImportData}
            className="hidden"
          />
        </label>
      </div>
    </aside>
  );
};
