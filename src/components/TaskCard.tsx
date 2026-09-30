import React, { useState } from 'react';
import { Task, Category, ThemeId, IconStyle } from '../types/todo';
import { THEMES } from '../utils/theme';
import { getCategoryIcon } from '../utils/categoryIcons';
import { formatDueDateDisplay, getOverdueDurationString, isTaskOverdue } from '../utils/date';
import {
  Check,
  Calendar,
  Clock,
  Bell,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Play,
  AlertCircle,
  Tag,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface TaskCardProps {
  task: Task;
  categories: Category[];
  currentTheme: ThemeId;
  iconStyle: IconStyle;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  categories,
  currentTheme,
  iconStyle,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  onStartFocus,
  onToggleSubtask,
}) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const themeConfig = THEMES[currentTheme];
  const isOverdue = isTaskOverdue(task);

  const category = categories.find((c) => c.id === task.categoryId) || {
    id: 'general',
    name: 'General',
    icon: 'Folder',
    color: '#64748b',
  };

  const CategoryIcon = getCategoryIcon(category.icon);

  // Subtask statistics
  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const priorityStyles = {
    low: { label: 'Low', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' },
    medium: { label: 'Medium', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
    high: { label: 'High', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    urgent: { label: 'Urgent', text: 'text-rose-600 dark:text-rose-400 font-semibold', dot: 'bg-rose-500 animate-pulse' },
  }[task.priority || 'medium'];

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-150 ${
        task.completed
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
          : isOverdue
          ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-700/60 hover:border-amber-400 shadow-xs'
          : 'bg-white dark:bg-slate-900 midnight:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      } p-4 md:p-4.5`}
    >
      <div className="flex items-start gap-3.5">
        {/* Themed Custom Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          className={`relative mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 active:scale-90 ${
            task.completed
              ? 'border-transparent text-white shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
          }`}
          style={{
            backgroundColor: task.completed ? themeConfig.accentHex : undefined,
            borderColor: task.completed ? themeConfig.accentHex : undefined,
          }}
          aria-label={task.completed ? 'Mark uncompleted' : 'Mark completed'}
        >
          {task.completed && (
            <Check className="w-3.5 h-3.5 stroke-[3] animate-scale-in" />
          )}
        </button>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Top Title & Quick Actions */}
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onEdit(task)}
              className={`text-sm md:text-base font-semibold cursor-pointer transition-colors leading-snug line-clamp-2 ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions Bar */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0 transition-opacity">
              {!task.completed && (
                <button
                  type="button"
                  onClick={() => onStartFocus(task)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Focus Pomodoro on this task"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onRequestDelete(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional Notes/Description */}
          {task.description && (
            <p
              onClick={() => onEdit(task)}
              className={`text-xs mt-1 cursor-pointer line-clamp-2 ${
                task.completed
                  ? 'line-through text-slate-400/80 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Clean Unboxed Metadata Line (anti-slop rule: no static pill enclosures, typographic separators) */}
          <div className="mt-2.5 flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {/* Category */}
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <CategoryIcon className="w-3.5 h-3.5 opacity-70" />
              <span>{category.name}</span>
            </span>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

            {/* Priority */}
            <span className={`inline-flex items-center gap-1 ${priorityStyles.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
              <span>{priorityStyles.label}</span>
            </span>

            {/* Due Date & Time */}
            {task.dueDate && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    isOverdue
                      ? 'text-amber-700 dark:text-amber-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDueDateDisplay(task.dueDate, task.dueTime)}</span>
                </span>
              </>
            )}

            {/* Overdue delta reminder tag if overdue */}
            {isOverdue && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/15 px-2 py-0.5 rounded-md">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>{getOverdueDurationString(task)}</span>
                </span>
              </>
            )}

            {/* Push Reminder status */}
            {task.reminderEnabled && task.dueTime && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400" title="Push notification enabled">
                  <Bell className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px]">Alarm</span>
                </span>
              </>
            )}

            {/* Subtask count */}
            {totalSubtasks > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  type="button"
                  onClick={() => setExpandedSubtasks(!expandedSubtasks)}
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{completedSubtasks}/{totalSubtasks} steps</span>
                  {expandedSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mt-2 flex items-center flex-wrap gap-1.5">
              {task.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Subtask Progress Bar & Expandable List */}
          {totalSubtasks > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {/* Mini progress line */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${subtaskProgress}%`,
                    backgroundColor: subtaskProgress === 100 ? '#10b981' : themeConfig.accentHex,
                  }}
                />
              </div>

              {expandedSubtasks && (
                <div className="space-y-1 mt-2">
                  {task.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onToggleSubtask(task.id, sub.id)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                          sub.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                        }`}
                      >
                        {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span
                        className={`text-xs ${
                          sub.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
