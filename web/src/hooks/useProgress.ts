import { useState, useEffect } from 'react';
import type { Progress, LearningMode } from '@/types/bird';
import { calculateAccuracy } from '@/utils/scoring';

const STORAGE_KEY = 'bird-learning-progress';

const DEFAULT_PROGRESS: Progress = {
  overallStats: {
    totalQuestions: 0,
    correct: 0,
    accuracy: 0,
    lastPlayed: new Date().toISOString(),
  },
  modeStats: { correct: 0, total: 0 },  // Single object since only 'mixed' mode exists
  speciesStats: {},
};

/**
 * Load progress from localStorage
 */
function loadProgress(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Migrate old format to new format
      if (parsed.modeStats && typeof parsed.modeStats === 'object') {
        if ('mixed' in parsed.modeStats) {
          // Old format - extract mixed mode stats
          parsed.modeStats = parsed.modeStats.mixed;
        }
      }

      return parsed;
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
  return DEFAULT_PROGRESS;
}

/**
 * Save progress to localStorage
 */
function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

/**
 * Hook for managing user progress and statistics
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  /**
   * Record an answer (correct or incorrect)
   */
  const recordAnswer = (
    speciesId: string,
    _mode: LearningMode,
    correct: boolean
  ) => {
    setProgress(prev => {
      const newProgress = { ...prev };

      // Update overall stats
      newProgress.overallStats.totalQuestions += 1;
      if (correct) {
        newProgress.overallStats.correct += 1;
      }
      newProgress.overallStats.accuracy = calculateAccuracy(
        newProgress.overallStats.correct,
        newProgress.overallStats.totalQuestions
      );
      newProgress.overallStats.lastPlayed = new Date().toISOString();

      // Update mode stats
      newProgress.modeStats.total += 1;
      if (correct) {
        newProgress.modeStats.correct += 1;
      }
      newProgress.modeStats.accuracy = calculateAccuracy(
        newProgress.modeStats.correct,
        newProgress.modeStats.total
      );

      // Update species stats
      if (!newProgress.speciesStats[speciesId]) {
        newProgress.speciesStats[speciesId] = {
          correct: 0,
          total: 0,
        };
      }
      newProgress.speciesStats[speciesId].total += 1;
      if (correct) {
        newProgress.speciesStats[speciesId].correct += 1;
      }
      newProgress.speciesStats[speciesId].lastSeen = new Date().toISOString();

      return newProgress;
    });
  };

  /**
   * Reset all progress
   */
  const resetProgress = () => {
    setProgress(DEFAULT_PROGRESS);
  };

  /**
   * Reset progress for the mode
   */
  const resetModeProgress = () => {
    setProgress(prev => ({
      ...prev,
      modeStats: { correct: 0, total: 0 },
    }));
  };

  /**
   * Get stats for the mode
   */
  const getModeStats = () => {
    return progress.modeStats;
  };

  /**
   * Get stats for a specific species
   */
  const getSpeciesStats = (speciesId: string) => {
    return progress.speciesStats[speciesId] || { correct: 0, total: 0 };
  };

  return {
    progress,
    recordAnswer,
    resetProgress,
    resetModeProgress,
    getModeStats,
    getSpeciesStats,
  };
}
