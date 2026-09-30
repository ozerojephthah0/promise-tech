import React, { useState } from 'react';
import { Category, Priority, Task, ThemeId } from '../types/todo';
import { THEMES } from '../utils/theme';
import { Plus, Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { getTodayString, getTomorrowString } from '../utils/date';
import { sounds } from '../utils/audio';

interface QuickAddTaskBarProps {
  onQuickAdd: (task: Partial<Task>) => void;
  categories: Category[];
  currentTheme: ThemeId;
  defaultCategoryId: string;
}

export const QuickAddTaskBar: React.FC<QuickAddTaskBarProps> = ({
  onQuickAdd,
  categories,
  currentTheme,
  defaultCategoryId,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState(defaultCategoryId === 'all' ? 'work' : defaultCategoryId);

  const themeConfig = THEMES[currentTheme];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playTick();
    onQuickAdd({
      title: title.trim(),
      categoryId: categoryId === 'all' ? 'work' : categoryId,
      dueDate,
      priority,
      completed: false,
      reminderEnabled: true,
      subtasks: [],
      tags: [],
    });

    setTitle('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl bg-white dark:bg-slate-900 midnight:bg-black p-3 md:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-offset-1 focus-within:border-transparent"
      style={{
        outlineColor: themeConfig.accentHex,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
          style={{ backgroundColor: themeConfig.accentHex }}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </div>

        <input
          type="text"
          placeholder="Add a new task... (e.g., 'Review sprint roadmap' or press Enter)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-sm md:text-base font-medium bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!title.trim()}
          className="hidden sm:flex items-center gap-1 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          style={{ backgroundColor: themeConfig.accentHex }}
        >
          <span>Add</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick contextual chips row */}
      {title.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center flex-wrap gap-2 animate-fade-in text-xs">
          {/* Due date picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <Calendar className="w-3 h-3 text-slate-400" />
            <select
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value={getTodayString()}>Today</option>
              <option value={getTomorrowString()}>Tomorrow</option>
              <option value="">No date</option>
            </select>
          </div>

          {/* Category picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <Tag className="w-3 h-3 text-slate-400" />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              {categories
                .filter((c) => c.id !== 'all')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Priority picker */}
          <div className="flex items-center gap-1">
            {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={`px-2 py-0.5 rounded-md font-semibold text-[11px] capitalize transition-all ${
                  priority === p
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};
