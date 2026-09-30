import React from 'react';
import { ThemeId, DarkModeOption, IconStyle } from '../types/todo';
import { THEMES } from '../utils/theme';
import {
  CheckSquare,
  Plus,
  Search,
  Palette,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Sparkles,
  Layers
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  currentTheme: ThemeId;
  currentDarkMode: DarkModeOption;
  soundEnabled: boolean;
  notificationPermission: NotificationPermission;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenThemeModal: () => void;
  onToggleDarkMode: () => void;
  onToggleSound: () => void;
  onRequestNotifications: () => void;
  onOpenNewTaskModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  currentDarkMode,
  soundEnabled,
  notificationPermission,
  searchQuery,
  onSearchChange,
  onOpenThemeModal,
  onToggleDarkMode,
  onToggleSound,
  onRequestNotifications,
  onOpenNewTaskModal,
}) => {
  const themeConfig = THEMES[currentTheme];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 midnight:bg-black/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: themeConfig.accentHex }}
          >
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Promise <span style={{ color: themeConfig.accentHex }}>Tech</span>
          </span>
        </div>

        {/* Zone 2: Search input & quick search filter */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, #tags, or descriptions... (Press /)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100/70 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
              style={{
                outlineColor: themeConfig.accentHex,
              }}
            />
          </div>
        </div>

        {/* Zone 3: Primary actions (Theme Switcher, Dark Mode, Push, Audio, and + New Task CTA) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Selector Palette Button */}
          <button
            type="button"
            onClick={onOpenThemeModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-xs"
            title="Customize Themes & Colors"
          >
            <span
              className="w-3.5 h-3.5 rounded-full shadow-inner"
              style={{ backgroundColor: themeConfig.accentHex }}
            />
            <span className="hidden sm:inline capitalize">{themeConfig.name.split(' ')[0]}</span>
            <Palette className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={`Toggle Theme Mode (Current: ${currentDarkMode})`}
            aria-label="Toggle theme appearance mode"
          >
            {currentDarkMode === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : currentDarkMode === 'dark' ? (
              <Sparkles className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Push Notification Toggle */}
          <button
            type="button"
            onClick={onRequestNotifications}
            className={`p-2 rounded-xl transition-colors ${
              notificationPermission === 'granted'
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={
              notificationPermission === 'granted'
                ? 'Push Notifications Active'
                : 'Click to Enable Scheduled Push Notifications'
            }
            aria-label="Toggle Push Notification Reminders"
          >
            {notificationPermission === 'granted' ? (
              <Bell className="w-4 h-4 fill-amber-500/20" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl transition-colors ${
              soundEnabled
                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
            aria-label="Toggle sound effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Primary Action Button: + New Task */}
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap"
            style={{ backgroundColor: themeConfig.accentHex }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
