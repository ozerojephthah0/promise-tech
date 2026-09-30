import React, { useState, useEffect } from 'react';
import { Task, Category, Priority, Subtask, ThemeId } from '../types/todo';
import { THEMES } from '../utils/theme';
import { getCategoryIcon } from '../utils/categoryIcons';
import { getTodayString, getTomorrowString } from '../utils/date';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Bell,
  Check,
  Tag,
  AlignLeft,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  initialTask?: Task | null;
  categories: Category[];
  currentTheme: ThemeId;
  defaultCategoryId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  categories,
  currentTheme,
  defaultCategoryId = 'work',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);

  const themeConfig = THEMES[currentTheme];

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategoryId(initialTask.categoryId || 'work');
      setPriority(initialTask.priority || 'medium');
      setDueDate(initialTask.dueDate || '');
      setDueTime(initialTask.dueTime || '');
      setReminderEnabled(initialTask.reminderEnabled ?? true);
      setTags(initialTask.tags || []);
      setSubtasks(initialTask.subtasks || []);
      setEstimatedMinutes(initialTask.estimatedMinutes || 25);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(defaultCategoryId === 'all' ? 'work' : defaultCategoryId);
      setPriority('medium');
      setDueDate(getTodayString());
      setDueTime('12:00');
      setReminderEnabled(true);
      setTags([]);
      setSubtasks([]);
      setEstimatedMinutes(25);
    }
  }, [initialTask, isOpen, defaultCategoryId]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    sounds.playTick();
    const newSubtask: Subtask = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: subtaskInput.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSubtask]);
    setSubtaskInput('');
  };

  const handleToggleSubtask = (id: string) => {
    sounds.playTick();
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    sounds.playTick();
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playTick();
    onSave({
      id: initialTask ? initialTask.id : undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      reminderEnabled,
      tags,
      subtasks,
      estimatedMinutes,
      completed: initialTask ? initialTask.completed : false,
    });
    onClose();
  };

  const priorities: { id: Priority; label: string; color: string; border: string }[] = [
    { id: 'low', label: 'Low', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-700' },
    { id: 'medium', label: 'Medium', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50', border: 'border-blue-300 dark:border-blue-800' },
    { id: 'high', label: 'High', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-300 dark:border-amber-800' },
    { id: 'urgent', label: 'Urgent', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-300 dark:border-rose-800' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: themeConfig.accentHex }}
            />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., Finalize project milestone sprint deck"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
              style={{
                outlineColor: themeConfig.accentHex,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Notes & Description</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add extra context, links, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2"
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

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {priorities.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-lg border transition-all ${p.color} ${
                        isSelected
                          ? 'ring-2 ring-slate-900 dark:ring-white border-transparent shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date, Time & Push Notification Row */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Schedule & Push Reminder
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDueDate(getTodayString())}
                  className="px-2 py-1 text-xs font-medium rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate(getTomorrowString())}
                  className="px-2 py-1 text-xs font-medium rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Tomorrow
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Due Date */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Due Time */}
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due Time (Exact Hour)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  {dueTime && (
                    <button
                      type="button"
                      onClick={() => setDueTime('')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Clear time"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Push Reminder Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 border-slate-300"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Send push notification reminder when due time arrives</span>
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Est.</span>
                <input
                  type="number"
                  min="5"
                  max="240"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center"
                />
                <span className="text-xs text-slate-500">min</span>
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist Builder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Checklist & Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})</span>
              </label>
            </div>

            {/* List */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          sub.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                        }`}
                      >
                        {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span
                        className={`text-xs font-medium truncate ${
                          sub.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {sub.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Subtask Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type tag name and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Add Tag
              </button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: themeConfig.accentHex }}
          >
            <Check className="w-4 h-4" />
            <span>{initialTask ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
