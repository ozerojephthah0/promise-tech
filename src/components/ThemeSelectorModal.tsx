import React from 'react';
import { ThemeId, DarkModeOption, IconStyle } from '../types/todo';
import { THEMES } from '../utils/theme';
import { X, Check, Palette, Moon, Sun, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  currentDarkMode: DarkModeOption;
  onSelectDarkMode: (mode: DarkModeOption) => void;
  iconStyle: IconStyle;
  onSelectIconStyle: (style: IconStyle) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  currentDarkMode,
  onSelectDarkMode,
  iconStyle,
  onSelectIconStyle,
}) => {
  if (!isOpen) return null;

  const themeList = Object.values(THEMES);

  const handleThemeChange = (themeId: ThemeId) => {
    sounds.playTick();
    onSelectTheme(themeId);
  };

  const handleDarkModeChange = (mode: DarkModeOption) => {
    sounds.playTick();
    onSelectDarkMode(mode);
  };

  const handleIconStyleChange = (style: IconStyle) => {
    sounds.playTick();
    onSelectIconStyle(style);
  };

  const activeThemeConfig = THEMES[currentTheme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 midnight:bg-black rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${activeThemeConfig.primaryLightClass}`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customize Experience & Themes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personalize color palette, dark mode, and UI accents across the entire app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Color Themes (Orange, Blue, Pink, Emerald, Purple) */}
        <div className="mt-6">
          <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Color Theme Palette
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {themeList.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`relative flex flex-col text-left p-3.5 rounded-xl border-2 transition-all group ${
                    isSelected
                      ? `border-${t.id === 'orange' ? 'orange-500' : t.id === 'blue' ? 'blue-600' : t.id === 'pink' ? 'pink-600' : t.id === 'emerald' ? 'emerald-600' : 'purple-600'} bg-slate-50 dark:bg-slate-800/80 shadow-sm`
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                  style={{
                    borderColor: isSelected ? t.accentHex : undefined
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center text-white"
                        style={{ backgroundColor: t.accentHex }}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {t.name}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 mb-3">
                    {t.tagline}
                  </p>

                  {/* Swatch chips */}
                  <div className="flex items-center gap-1.5 mt-auto pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    {t.confettiColors.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-md shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Dark Mode Options */}
        <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Appearance Mode
          </label>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <button
              onClick={() => handleDarkModeChange('light')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                currentDarkMode === 'light'
                  ? 'border-slate-900 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-900/10'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Light Mode</p>
                <p className="text-xs text-slate-500">Crisp & luminous</p>
              </div>
            </button>

            <button
              onClick={() => handleDarkModeChange('dark')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                currentDarkMode === 'dark'
                  ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-900/10'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-900/30 text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dark Slate</p>
                <p className="text-xs text-slate-500">Soft night contrast</p>
              </div>
            </button>

            <button
              onClick={() => handleDarkModeChange('midnight')}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                currentDarkMode === 'midnight'
                  ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-900/10'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-purple-950 text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Midnight AMOLED</p>
                <p className="text-xs text-slate-500">Deep obsidian glow</p>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Icon & Accent Style */}
        <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Icon & Accent Style
          </label>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { id: 'modern', label: 'Modern Stroked', desc: 'Crisp & minimal', icon: Layers },
              { id: 'duotone', label: 'Vibrant Duotone', desc: 'Soft tinted depth', icon: Sparkles },
              { id: 'minimal', label: 'Solid Accent', desc: 'High contrast', icon: ShieldCheck },
            ].map((styleItem) => {
              const isSelected = iconStyle === styleItem.id;
              const IconComp = styleItem.icon;
              return (
                <button
                  key={styleItem.id}
                  onClick={() => handleIconStyleChange(styleItem.id as IconStyle)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ring-2 ring-slate-900/10'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeThemeConfig.primaryLightClass}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{styleItem.label}</p>
                    <p className="text-xs text-slate-500">{styleItem.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Bar */}
        <div className="mt-8 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Active Theme Live Preview
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-transform active:scale-95"
              style={{ backgroundColor: activeThemeConfig.accentHex }}
            >
              Primary Action Button
            </button>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-medium border"
              style={{
                backgroundColor: `${activeThemeConfig.accentHex}15`,
                borderColor: `${activeThemeConfig.accentHex}40`,
                color: activeThemeConfig.accentHex
              }}
            >
              Active Filter Tab
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: activeThemeConfig.accentHex }}
              />
              <span>{activeThemeConfig.name}</span>
              <span className="text-slate-400">·</span>
              <span className="capitalize">{currentDarkMode} mode</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-md transition-all active:scale-95"
            style={{ backgroundColor: activeThemeConfig.accentHex }}
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
