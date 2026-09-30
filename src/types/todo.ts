export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  categoryId: string;
  priority: Priority;
  tags: string[];
  subtasks: Subtask[];
  reminderEnabled: boolean;
  reminderNotified?: boolean;
  estimatedMinutes?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string; // Hex or tailwind color
  isCustom?: boolean;
}

export type ThemeId = 'orange' | 'blue' | 'pink' | 'emerald' | 'purple';
export type DarkModeOption = 'light' | 'dark' | 'midnight';
export type IconStyle = 'modern' | 'duotone' | 'minimal';

export type FilterStatus = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'urgent';
export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'alphabetical' | 'subtasks';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  accentHex: string;
  primaryClass: string;
  primaryLightClass: string;
  secondaryClass: string;
  bgTintClass: string;
  borderClass: string;
  textClass: string;
  ringClass: string;
  hoverClass: string;
  gradient: string;
  confettiColors: string[];
  iconAccent: string;
}
