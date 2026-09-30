import { Task } from '../types/todo';

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Checks if a task is overdue relative to the current timestamp.
 * If task is completed, it's not overdue.
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.completed || !task.dueDate) return false;

  const now = new Date();
  const todayStr = getTodayString();
  const currentTimeStr = getCurrentTimeString();

  if (task.dueDate < todayStr) {
    return true;
  }

  if (task.dueDate === todayStr) {
    if (task.dueTime) {
      return task.dueTime < currentTimeStr;
    }
    // If no dueTime is specified on today's date, it is considered due today (not overdue until tomorrow)
    return false;
  }

  return false;
}

/**
 * Checks if a task is due today
 */
export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false;
  return task.dueDate === getTodayString();
}

/**
 * Checks if a task is due in the future (after today)
 */
export function isTaskUpcoming(task: Task): boolean {
  if (!task.dueDate) return false;
  return task.dueDate > getTodayString();
}

/**
 * Formats due date & time into a friendly string
 */
export function formatDueDateDisplay(dueDate?: string, dueTime?: string): string {
  if (!dueDate) return '';

  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();

  let dateLabel = '';
  if (dueDate === todayStr) {
    dateLabel = 'Today';
  } else if (dueDate === tomorrowStr) {
    dateLabel = 'Tomorrow';
  } else {
    const parts = dueDate.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      dateLabel = dueDate;
    }
  }

  if (dueTime) {
    // Format 24h into 12h AM/PM
    const [h, m] = dueTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      const formattedTime = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
      return `${dateLabel} at ${formattedTime}`;
    }
    return `${dateLabel} at ${dueTime}`;
  }

  return dateLabel;
}

/**
 * Returns human readable overdue delta (e.g. "Overdue by 2 hours", "Overdue by 1 day")
 */
export function getOverdueDurationString(task: Task): string {
  if (!task.dueDate) return 'Overdue';

  const now = new Date();
  let dueDateTime: Date;

  if (task.dueTime) {
    dueDateTime = new Date(`${task.dueDate}T${task.dueTime}:00`);
  } else {
    // End of that day
    dueDateTime = new Date(`${task.dueDate}T23:59:59`);
  }

  const diffMs = now.getTime() - dueDateTime.getTime();
  if (diffMs <= 0) return 'Due now';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `Overdue by ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  if (diffHours > 0) {
    return `Overdue by ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
  }
  if (diffMins > 0) {
    return `Overdue by ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  }
  return 'Just became overdue';
}
