import { Task, Category } from '../types/todo';
import { getTodayString, getTomorrowString } from './date';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work & Career', icon: 'Briefcase', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', icon: 'User', color: '#ec4899' },
  { id: 'study', name: 'Learning & Study', icon: 'GraduationCap', color: '#8b5cf6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingCart', color: '#10b981' },
  { id: 'fitness', name: 'Health & Workout', icon: 'Flame', color: '#f97316' },
  { id: 'finance', name: 'Budget & Finance', icon: 'Wallet', color: '#06b6d4' },
];

export function getInitialTasks(): Task[] {
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  // Create a past date for overdue sample demonstration
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  const pastDateStr = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'task-1',
      title: 'Submit quarterly design audit presentation',
      description: 'Review color harmony, typography pairing scale, and responsive layout across team boards.',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: pastDateStr,
      dueTime: '09:00',
      categoryId: 'work',
      priority: 'urgent',
      tags: ['Work', 'Q3', 'Design'],
      subtasks: [
        { id: 'sub-1', title: 'Compile Figma prototype screenshots', completed: true },
        { id: 'sub-2', title: 'Verify contrast ratios for dark theme', completed: false },
        { id: 'sub-3', title: 'Export final deck PDF', completed: false }
      ],
      reminderEnabled: true,
      reminderNotified: false,
      estimatedMinutes: 45
    },
    {
      id: 'task-2',
      title: 'Explore and switch themes in Promise Tech',
      description: 'Click on the theme switcher at the top right to try Orange, Blue, Pink, and Dark Mode!',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: today,
      dueTime: '14:30',
      categoryId: 'personal',
      priority: 'high',
      tags: ['App', 'Theme', 'Customization'],
      subtasks: [
        { id: 'sub-4', title: 'Test the Vibrant Orange theme', completed: false },
        { id: 'sub-5', title: 'Test the Cobalt Blue theme', completed: false },
        { id: 'sub-6', title: 'Test the Neon Blossom Pink theme', completed: false },
        { id: 'sub-7', title: 'Complete a task to enjoy the confetti celebration!', completed: false }
      ],
      reminderEnabled: true,
      reminderNotified: false,
      estimatedMinutes: 10
    },
    {
      id: 'task-3',
      title: '30-minute interval sprint & core workout',
      description: 'Warm up 5 mins, 20 mins HIIT sprint intervals on treadmill, 5 mins cool down stretches.',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: today,
      dueTime: '18:00',
      categoryId: 'fitness',
      priority: 'medium',
      tags: ['Health', 'Cardio', 'Routine'],
      subtasks: [],
      reminderEnabled: true,
      reminderNotified: false,
      estimatedMinutes: 30
    },
    {
      id: 'task-4',
      title: 'Weekly farmer’s market grocery haul',
      description: 'Fresh avocados, sourdough bread, oat milk, cold brew, and berries.',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: tomorrow,
      dueTime: '10:00',
      categoryId: 'shopping',
      priority: 'low',
      tags: ['Groceries', 'Home'],
      subtasks: [
        { id: 'sub-8', title: 'Organic gala apples & blueberries', completed: true },
        { id: 'sub-9', title: 'Whole wheat artisan loaf', completed: false },
        { id: 'sub-10', title: 'Fresh rosemary and olive oil', completed: false }
      ],
      reminderEnabled: false,
      reminderNotified: false,
      estimatedMinutes: 25
    },
    {
      id: 'task-5',
      title: 'Complete TypeScript 5.5 features deep dive',
      description: 'Read the official documentation on inferred type predicates and regex syntax checks.',
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      dueDate: today,
      dueTime: '11:00',
      categoryId: 'study',
      priority: 'medium',
      tags: ['Coding', 'TypeScript'],
      subtasks: [
        { id: 'sub-11', title: 'Review release notes', completed: true },
        { id: 'sub-12', title: 'Code demo sandbox tests', completed: true }
      ],
      reminderEnabled: false,
      reminderNotified: false,
      estimatedMinutes: 60
    }
  ];
}
