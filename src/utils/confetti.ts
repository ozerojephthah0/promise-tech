import confetti from 'canvas-confetti';
import { THEMES } from './theme';
import { ThemeId } from '../types/todo';

/**
 * Triggers a vibrant, celebratory multi-burst confetti animation
 * matching the selected theme color palette!
 */
export function fireConfettiReward(themeId: ThemeId) {
  const theme = THEMES[themeId] || THEMES.orange;
  const colors = theme.confettiColors;

  // First center burst
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.7, x: 0.5 },
    colors: colors,
    ticks: 200,
    gravity: 1.1,
    scalar: 1.1,
    shapes: ['circle', 'square'],
  });

  // Secondary side cannons for celebratory feel
  setTimeout(() => {
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.75 },
      colors: colors,
    });
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.75 },
      colors: colors,
    });
  }, 120);

  // Gentle star / glitter shower
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { y: 0.4, x: 0.5 },
      colors: ['#ffffff', ...colors],
      scalar: 0.8,
    });
  }, 250);
}
