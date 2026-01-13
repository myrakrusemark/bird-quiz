/**
 * Quiz Selectors
 *
 * Memoized selectors for deriving data from quiz state.
 * These help prevent unnecessary recalculations.
 */

import type { QuizState } from '@/reducers/quizReducer';
import { calculateAccuracy } from '@/utils/scoring';

/**
 * Calculate rolling accuracy from the circular buffer of last 20 answers
 */
export function selectRollingAccuracy(state: QuizState): number {
  const { answers } = state.progress.rollingStats;

  if (answers.length === 0) return 0;

  const correct = answers.filter((a) => a.correct).length;
  return calculateAccuracy(correct, answers.length);
}

/**
 * Get current streak
 */
export function selectCurrentStreak(state: QuizState): number {
  return state.progress.rollingStats.currentStreak;
}

/**
 * Get max streak
 */
export function selectMaxStreak(state: QuizState): number {
  return state.progress.rollingStats.maxStreak;
}

/**
 * Get total answers count
 */
export function selectTotalAnswers(state: QuizState): number {
  return state.progress.rollingStats.totalAnswers;
}

/**
 * Get rolling answers array
 */
export function selectRollingAnswers(state: QuizState) {
  return state.progress.rollingStats.answers;
}

/**
 * Get overall accuracy
 */
export function selectOverallAccuracy(state: QuizState): number {
  return state.progress.overallStats.accuracy;
}

/**
 * Get species that need practice (low accuracy)
 */
export function selectWeakSpecies(state: QuizState, threshold: number = 0.5) {
  return Object.entries(state.progress.speciesStats)
    .filter(([_, stats]) => {
      const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
      return accuracy < threshold && stats.total >= 3; // At least 3 attempts
    })
    .map(([speciesId, stats]) => ({
      speciesId,
      accuracy: stats.correct / stats.total,
      total: stats.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Check if quiz is ready to start
 */
export function selectIsQuizReady(state: QuizState): boolean {
  return state.birds.length > 0 && !state.birdsLoading && !state.birdsError;
}

/**
 * Check if loading
 */
export function selectIsLoading(state: QuizState): boolean {
  return state.birdsLoading;
}

/**
 * Get error message
 */
export function selectError(state: QuizState): string | null {
  return state.birdsError;
}
