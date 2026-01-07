/**
 * Scoring utilities for the quiz
 */

export const SCORE_VALUES = {
  CORRECT: 10,
  FIRST_TRY_BONUS: 5,
  STREAK_MULTIPLIER: 2,
  MAX_STREAK_BONUS: 10,
};

/**
 * Calculate score for a correct answer
 */
export function calculateScore(
  isCorrect: boolean,
  isFirstTry: boolean,
  currentStreak: number
): number {
  if (!isCorrect) return 0;

  let score = SCORE_VALUES.CORRECT;

  if (isFirstTry) {
    score += SCORE_VALUES.FIRST_TRY_BONUS;
  }

  // Streak bonus (capped)
  const streakBonus = Math.min(
    currentStreak * SCORE_VALUES.STREAK_MULTIPLIER,
    SCORE_VALUES.MAX_STREAK_BONUS
  );
  score += streakBonus;

  return score;
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Get performance level based on accuracy
 */
export function getPerformanceLevel(accuracy: number): {
  level: string;
  color: string;
  emoji: string;
} {
  if (accuracy >= 90) {
    return { level: 'Expert', color: 'text-green-600', emoji: '🏆' };
  } else if (accuracy >= 75) {
    return { level: 'Advanced', color: 'text-blue-600', emoji: '⭐' };
  } else if (accuracy >= 60) {
    return { level: 'Intermediate', color: 'text-yellow-600', emoji: '📚' };
  } else if (accuracy >= 40) {
    return { level: 'Beginner', color: 'text-orange-600', emoji: '🌱' };
  } else {
    return { level: 'Novice', color: 'text-red-600', emoji: '🐣' };
  }
}
