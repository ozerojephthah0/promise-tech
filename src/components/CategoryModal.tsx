import React, { useState } from 'react';
import { Category, ThemeId } from '../types/todo';
import { THEMES } from '../utils/theme';
import { X, Check, Plus, FolderPlus } from 'lucide-react';
import { ICON_MAP } from '../utils/categoryIcons';
import { sounds } from '../utils/audio';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (category: Category) => void;
  currentTheme: ThemeId;
}

const AVAILABLE_ICONS = [
  'Folder',
  'Briefcase',
  'User',
  'GraduationCap',
  'ShoppingCart',
  'Flame',
  'Wallet',
  'Sparkles',
  'Heart',
  'Code',
  'BookOpen',
  'Coffee',
  'Smile',
];

const PRESET_COLORS = [
  '#f97316', // orange
  '#2563eb', // blue
  '#ec4899', // pink
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#64748b', // slate
  '#ef4444', // red
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
  currentTheme,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [selectedColor, setSelectedColor] = useState('#f97316');

  if (!isOpen) return null;

  const themeConfig = THEMES[currentTheme];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sounds.playTick();
    const newCategory: Category = {
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      isCustom: true,
    };

    onSaveCategory(newCategory);
    setName('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${themeConfig.primaryLightClass}`}>
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Category</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Side Hustle, Vacation, Gardening"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Select Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((iconKey) => {
                const IconComp = ICON_MAP[iconKey] || FolderPlus;
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    type="button"
                    key={iconKey}
                    onClick={() => setSelectedIcon(iconKey)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-900/10'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComp
                      className="w-4 h-4"
                      style={{ color: isSelected ? selectedColor : undefined }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all active:scale-95"
              style={{ backgroundColor: selectedColor }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
