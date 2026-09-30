import React, { useState, useEffect } from 'react';
import { Task, ThemeId } from '../types/todo';
import { THEMES } from '../utils/theme';
import { X, Play, Pause, RotateCcw, CheckCircle2, Flame, Bell } from 'lucide-react';
import { sounds } from '../utils/audio';
import { fireConfettiReward } from '../utils/confetti';
import { sendPushNotification } from '../utils/notifications';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentTheme: ThemeId;
  onCompleteTask: (taskId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  task,
  currentTheme,
  onCompleteTask,
}) => {
  const defaultSeconds = (task?.estimatedMinutes || 25) * 60;
  const [timeLeft, setTimeLeft] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');

  const themeConfig = THEMES[currentTheme];

  useEffect(() => {
    if (task) {
      const secs = (task.estimatedMinutes || 25) * 60;
      setTimeLeft(secs);
      setIsRunning(false);
      setMode('focus');
    }
  }, [task, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      sounds.playTimerBell();
      fireConfettiReward(currentTheme);
      sendPushNotification('Focus Session Completed! 🎉', {
        body: task ? `Great job working on: ${task.title}` : 'Your focus sprint is complete!',
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, task, currentTheme]);

  if (!isOpen) return null;

  const toggleRun = () => {
    sounds.playTick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    sounds.playTick();
    setIsRunning(false);
    if (mode === 'focus') {
      setTimeLeft((task?.estimatedMinutes || 25) * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(5 * 60);
    } else {
      setTimeLeft(15 * 60);
    }
  };

  const setTimerMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
    sounds.playTick();
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'focus') setTimeLeft((task?.estimatedMinutes || 25) * 60);
    if (newMode === 'shortBreak') setTimeLeft(5 * 60);
    if (newMode === 'longBreak') setTimeLeft(15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = mode === 'focus' ? (task?.estimatedMinutes || 25) * 60 : mode === 'shortBreak' ? 300 : 900;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 midnight:bg-black rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Pomodoro Focus Sprint</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task target info */}
        {task && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-left">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Target</span>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
              {task.title}
            </p>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-5">
          <button
            onClick={() => setTimerMode('focus')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'focus'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Focus ({task?.estimatedMinutes || 25}m)
          </button>
          <button
            onClick={() => setTimerMode('shortBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setTimerMode('longBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Big Timer Display */}
        <div className="relative my-8 flex items-center justify-center">
          {/* Circular progress container */}
          <div className="w-52 h-52 rounded-full flex flex-col items-center justify-center border-8 border-slate-100 dark:border-slate-800 relative shadow-inner">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-transparent"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={themeConfig.accentHex}
                strokeWidth="7"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-linear"
              />
            </svg>

            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {formattedTime}
            </span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">
              {isRunning ? 'In Progress' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRun}
            className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-2xl shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: themeConfig.accentHex }}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Sprint</span>
              </>
            )}
          </button>

          {task && !task.completed && (
            <button
              onClick={() => {
                onCompleteTask(task.id);
                onClose();
              }}
              className="p-3 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-2xl transition-colors"
              title="Mark Task Finished"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
