/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Category,
  DarkModeOption,
  FilterStatus,
  IconStyle,
  Priority,
  SortOption,
  Task,
  ThemeId,
} from './types/todo';
import { THEMES } from './utils/theme';
import { getInitialTasks, INITIAL_CATEGORIES } from './utils/initialData';
import {
  formatDueDateDisplay,
  getCurrentTimeString,
  getTodayString,
  getTomorrowString,
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
} from './utils/date';
import { sounds } from './utils/audio';
import { fireConfettiReward } from './utils/confetti';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendPushNotification,
  sendTaskReminderNotification,
} from './utils/notifications';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { OverdueAlertBanner } from './components/OverdueAlertBanner';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { CategoryModal } from './components/CategoryModal';
import { StatsModal } from './components/StatsModal';
import { QuickAddTaskBar } from './components/QuickAddTaskBar';

// Icons
import {
  CheckCircle2,
  ListFilter,
  ArrowUpDown,
  Sparkles,
  CheckCheck,
  Plus,
  Bell,
  Search,
  FolderPlus,
  Flame,
  X,
} from 'lucide-react';

export default function App() {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('taskflow_theme');
    return (saved as ThemeId) || 'orange';
  });

  const [currentDarkMode, setCurrentDarkMode] = useState<DarkModeOption>(() => {
    const saved = localStorage.getItem('taskflow_dark_mode');
    return (saved as DarkModeOption) || 'light';
  });

  const [iconStyle, setIconStyle] = useState<IconStyle>(() => {
    const saved = localStorage.getItem('taskflow_icon_style');
    return (saved as IconStyle) || 'modern';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sounds.isEnabled());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  // Tasks & Categories State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialTasks();
      }
    }
    return getInitialTasks();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('taskflow_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [{ id: 'all', name: 'All Tasks', icon: 'ListFilter', color: '#64748b' }, ...INITIAL_CATEGORIES];
      }
    }
    return [{ id: 'all', name: 'All Tasks', icon: 'ListFilter', color: '#64748b' }, ...INITIAL_CATEGORIES];
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('taskflow_streak');
    return saved ? Number(saved) : 3;
  });

  // Filter & Search State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);

  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState<boolean>(false);
  const [focusTargetTask, setFocusTargetTask] = useState<Task | null>(null);

  // Toast / notification feedback state
  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; type?: 'info' | 'success' } | null>(null);

  // Reference for previous overdue count to trigger gentle audio chime only on new overdue
  const prevOverdueCountRef = useRef<number>(0);

  const themeConfig = THEMES[currentTheme] || THEMES.orange;

  // Apply dark mode & theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'midnight');
    if (currentDarkMode === 'dark') {
      root.classList.add('dark');
    } else if (currentDarkMode === 'midnight') {
      root.classList.add('dark', 'midnight');
    }
    localStorage.setItem('taskflow_dark_mode', currentDarkMode);
  }, [currentDarkMode]);

  // Persist Theme & Style
  useEffect(() => {
    localStorage.setItem('taskflow_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('taskflow_icon_style', iconStyle);
  }, [iconStyle]);

  // Persist Tasks & Categories
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('taskflow_streak', String(streak));
  }, [streak]);

  // Overdue Check & Notification Alarm background loop
  useEffect(() => {
    const checkScheduleAndOverdue = () => {
      const todayStr = getTodayString();
      const currentTime = getCurrentTimeString();

      // 1. Check for tasks scheduled for right now to trigger Push Notification
      setTasks((prevTasks) => {
        let changed = false;
        const updated = prevTasks.map((t) => {
          if (
            !t.completed &&
            t.reminderEnabled &&
            !t.reminderNotified &&
            t.dueDate === todayStr &&
            t.dueTime &&
            t.dueTime <= currentTime
          ) {
            // Trigger Push Notification & Chime
            sendTaskReminderNotification(t);
            sounds.playOverdueAlert();
            showToast(`⏰ Scheduled Reminder: "${t.title}" is due now!`, 'info');
            changed = true;
            return { ...t, reminderNotified: true };
          }
          return t;
        });
        return changed ? updated : prevTasks;
      });

      // 2. Count current overdue tasks
      const currentOverdueCount = tasks.filter((t) => isTaskOverdue(t)).length;
      if (currentOverdueCount > prevOverdueCountRef.current) {
        sounds.playOverdueAlert();
      }
      prevOverdueCountRef.current = currentOverdueCount;
    };

    // Initial run + Interval every 10 seconds
    checkScheduleAndOverdue();
    const interval = setInterval(checkScheduleAndOverdue, 10000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when inside input/textarea
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingTask(null);
        setIsTaskModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsThemeModalOpen(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleToggleDarkMode();
      } else if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsThemeModalOpen(false);
        setIsCategoryModalOpen(false);
        setIsStatsModalOpen(false);
        setIsFocusTimerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDarkMode]);

  const showToast = (text: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToastMessage({ id, text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  };

  // Handlers
  const handleToggleDarkMode = () => {
    sounds.playTick();
    setCurrentDarkMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'midnight';
      return 'light';
    });
  };

  const handleToggleSound = () => {
    const enabled = sounds.toggleSound();
    setSoundEnabled(enabled);
    showToast(enabled ? 'Sound effects enabled' : 'Sound effects muted');
  };

  const handleRequestNotifications = async () => {
    sounds.playTick();
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      sendPushNotification('Promise Tech Notifications Enabled 🎉', {
        body: 'You will now receive timely push reminders for your scheduled tasks!',
      });
      showToast('Push notifications successfully enabled!', 'success');
    } else {
      showToast('Push notifications were not granted in browser settings.');
    }
  };

  // Task Actions
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
      showToast('Task updated');
    } else {
      // Create new
      const newTask: Task = {
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: taskData.title || 'Untitled Task',
        description: taskData.description,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: taskData.dueDate || getTodayString(),
        dueTime: taskData.dueTime,
        categoryId: taskData.categoryId || 'work',
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
        reminderEnabled: taskData.reminderEnabled ?? true,
        reminderNotified: false,
        estimatedMinutes: taskData.estimatedMinutes || 25,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('New task added');
    }
  };

  // Completing a Task -> Confetti Reward & Sound!
  const handleToggleComplete = (task: Task) => {
    const nextCompleted = !task.completed;

    if (nextCompleted) {
      // REWARD WITH CONFETTI ANIMATION & CELEBRATION CHIME!
      fireConfettiReward(currentTheme);
      sounds.playCompletionChime();
      showToast(`🎉 Completed "${task.title}"! Streak continuing!`, 'success');
      setStreak((s) => s + 1);
    } else {
      sounds.playTick();
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  // Safe Deletion: asks for confirmation first
  const handleRequestDelete = (task: Task) => {
    sounds.playTick();
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task deleted');
  };

  const handleRescheduleTask = (taskId: string, newDate: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              dueDate: newDate,
              reminderNotified: false,
            }
          : t
      )
    );
    showToast('Task rescheduled to ' + newDate);
  };

  const handleStartFocus = (task: Task) => {
    sounds.playTick();
    setFocusTargetTask(task);
    setIsFocusTimerOpen(true);
  };

  const handleSaveCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    setSelectedCategoryId(newCat.id);
    showToast(`Category "${newCat.name}" created!`);
  };

  const handleResetDemoData = () => {
    setTasks(getInitialTasks());
    setCategories([
      { id: 'all', name: 'All Tasks', icon: 'ListFilter', color: '#64748b' },
      ...INITIAL_CATEGORIES,
    ]);
    setStreak(3);
    showToast('Reset to initial starter demo tasks');
  };

  const handleExportData = () => {
    sounds.playTick();
    const dataStr = JSON.stringify({ tasks, categories, version: '1.0' }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promise-tech-backup-${getTodayString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Task backup downloaded');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.tasks)) {
          setTasks(parsed.tasks);
          if (Array.isArray(parsed.categories)) {
            setCategories(parsed.categories);
          }
          showToast('Data imported successfully!', 'success');
        }
      } catch {
        showToast('Failed to import JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Overdue tasks for the Gentle Alert Banner
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => isTaskOverdue(t));
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Category filter
        if (selectedCategoryId !== 'all' && t.categoryId !== selectedCategoryId) {
          return false;
        }

        // Status view filter
        if (activeFilter === 'today' && (t.completed || !isTaskDueToday(t))) {
          return false;
        }
        if (activeFilter === 'overdue' && !isTaskOverdue(t)) {
          return false;
        }
        if (activeFilter === 'upcoming' && (t.completed || !isTaskUpcoming(t))) {
          return false;
        }
        if (activeFilter === 'completed' && !t.completed) {
          return false;
        }
        if (activeFilter === 'urgent' && (t.completed || (t.priority !== 'urgent' && t.priority !== 'high'))) {
          return false;
        }
        if (activeFilter === 'all' && t.completed && selectedCategoryId === 'all') {
          // Keep active view focused, completed visible at bottom
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = t.title.toLowerCase().includes(query);
          const matchDesc = t.description?.toLowerCase().includes(query);
          const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(query));
          if (!matchTitle && !matchDesc && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Keep completed at bottom for active views
        if (activeFilter !== 'completed') {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
        }

        // Sort options
        if (sortBy === 'priority') {
          const weight: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate) || (a.dueTime || '').localeCompare(b.dueTime || '');
        }
        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'subtasks') {
          return (b.subtasks?.length || 0) - (a.subtasks?.length || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, selectedCategoryId, activeFilter, searchQuery, sortBy]);

  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
      {/* Top Navigation Bar */}
      <Navbar
        currentTheme={currentTheme}
        currentDarkMode={currentDarkMode}
        soundEnabled={soundEnabled}
        notificationPermission={notificationPermission}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleSound={handleToggleSound}
        onRequestNotifications={handleRequestNotifications}
        onOpenNewTaskModal={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Overdue Gentle Alert Banner */}
        <OverdueAlertBanner
          overdueTasks={overdueTasks}
          onRescheduleTask={handleRescheduleTask}
          onCompleteTask={(taskId) => {
            const t = tasks.find((item) => item.id === taskId);
            if (t) handleToggleComplete(t);
          }}
          onSelectTaskToEdit={(t) => {
            setEditingTask(t);
            setIsTaskModalOpen(true);
          }}
        />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar (Categories & Filters) */}
          <Sidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            tasks={tasks}
            currentTheme={currentTheme}
            onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
            onOpenFocusTimer={() => {
              setFocusTargetTask(tasks.find((t) => !t.completed) || null);
              setIsFocusTimerOpen(true);
            }}
            onOpenStats={() => setIsStatsModalOpen(true)}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />

          {/* Right Main Task List Area */}
          <section className="flex-1 w-full min-w-0">
            {/* View Header & Quick Add */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-xs"
                    style={{ backgroundColor: activeCategory?.color || themeConfig.accentHex }}
                  />
                  <div>
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {selectedCategoryId === 'all'
                        ? activeFilter === 'today'
                          ? "Today's Focus"
                          : activeFilter === 'overdue'
                          ? 'Overdue Tasks'
                          : activeFilter === 'upcoming'
                          ? 'Upcoming Tasks'
                          : activeFilter === 'urgent'
                          ? 'High & Urgent Tasks'
                          : activeFilter === 'completed'
                          ? 'Completed History'
                          : 'All Tasks'
                        : activeCategory?.name}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found · {tasks.filter(t => t.completed).length} total finished
                    </p>
                  </div>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-medium text-slate-400">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 cursor-pointer shadow-xs"
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="createdAt">Created Date</option>
                      <option value="alphabetical">Title (A-Z)</option>
                      <option value="subtasks">Subtasks Count</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Add Bar */}
              <QuickAddTaskBar
                onQuickAdd={handleSaveTask}
                categories={categories}
                currentTheme={currentTheme}
                defaultCategoryId={selectedCategoryId}
              />
            </div>

            {/* Tasks Container */}
            {filteredTasks.length === 0 ? (
              <div className="py-16 px-6 text-center rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                <div
                  className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3 ${themeConfig.primaryLightClass}`}
                >
                  <CheckCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {searchQuery ? 'No matching tasks' : 'No tasks in this list'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {searchQuery
                    ? `No tasks matched "${searchQuery}". Try clearing search.`
                    : 'You’re all caught up! Create a new task to organize your day.'}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-4 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all"
                    style={{ backgroundColor: themeConfig.accentHex }}
                  >
                    + Add Your First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categories={categories}
                    currentTheme={currentTheme}
                    iconStyle={iconStyle}
                    onToggleComplete={handleToggleComplete}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsTaskModalOpen(true);
                    }}
                    onRequestDelete={handleRequestDelete}
                    onStartFocus={handleStartFocus}
                    onToggleSubtask={handleToggleSubtask}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-300 animate-scale-in text-xs font-semibold">
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        categories={categories}
        currentTheme={currentTheme}
        defaultCategoryId={selectedCategoryId}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        task={taskToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        currentDarkMode={currentDarkMode}
        onSelectDarkMode={setCurrentDarkMode}
        iconStyle={iconStyle}
        onSelectIconStyle={setIconStyle}
      />

      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => {
          setIsFocusTimerOpen(false);
          setFocusTargetTask(null);
        }}
        task={focusTargetTask}
        currentTheme={currentTheme}
        onCompleteTask={(taskId) => {
          const t = tasks.find((item) => item.id === taskId);
          if (t) handleToggleComplete(t);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSaveCategory={handleSaveCategory}
        currentTheme={currentTheme}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        tasks={tasks}
        categories={categories}
        currentTheme={currentTheme}
        streak={streak}
        onResetData={handleResetDemoData}
      />
    </div>
  );
}
