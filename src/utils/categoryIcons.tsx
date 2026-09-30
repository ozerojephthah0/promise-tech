import React from 'react';
import {
  Briefcase,
  User,
  GraduationCap,
  ShoppingCart,
  Flame,
  Wallet,
  Sparkles,
  Heart,
  Folder,
  Code,
  BookOpen,
  Coffee,
  Smile,
  LucideIcon,
  ListFilter,
  Award,
  TrendingUp,
  Target,
  Compass,
  Trophy,
  Rocket,
  Building
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  User,
  GraduationCap,
  ShoppingCart,
  Flame,
  Wallet,
  Sparkles,
  Heart,
  Folder,
  Code,
  BookOpen,
  Coffee,
  Smile,
  ListFilter,
  Award,
  TrendingUp,
  Target,
  Compass,
  Trophy,
  Rocket,
  Building
};

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return Folder;
  return ICON_MAP[iconName] || Folder;
}
