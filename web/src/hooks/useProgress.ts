import { useState, useEffect } from 'react';
import type { Progress, LearningMode, QuestionType, AnswerFormat, AnswerRecord } from '@/types/bird';
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
  rollingStats: {
    answers: [],
    currentStreak: 0,
    maxStreak: 0,
    totalAnswers: 0,
  },
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

      // Add rollingStats if missing (migration for endless mode)
      if (!parsed.rollingStats) {
        parsed.rollingStats = {
          answers: [],
          currentStreak: 0,
          maxStreak: 0,
          totalAnswers: 0,
        };
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
    correct: boolean,
    questionType: QuestionType,
    answerFormat: AnswerFormat
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

      // Update rolling stats (for endless mode)
      const newAnswer: AnswerRecord = {
        timestamp: new Date().toISOString(),
        speciesId,
        correct,
        questionType,
        answerFormat,
      };

      // Add to rolling window
      const updatedAnswers = [...newProgress.rollingStats.answers, newAnswer];

      // Keep only last 20 answers (circular buffer)
      if (updatedAnswers.length > 20) {
        updatedAnswers.shift(); // Remove oldest
      }

      // Update streak
      const newStreak = correct ? newProgress.rollingStats.currentStreak + 1 : 0;
      const maxStreak = Math.max(newProgress.rollingStats.maxStreak, newStreak);

      newProgress.rollingStats = {
        answers: updatedAnswers,
        currentStreak: newStreak,
        maxStreak,
        totalAnswers: newProgress.rollingStats.totalAnswers + 1,
      };

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

  /**
   * Get rolling accuracy percentage (0-100)
   */
  const getRollingAccuracy = () => {
    const { answers } = progress.rollingStats;
    if (answers.length === 0) return 0;
    const correctCount = answers.filter(a => a.correct).length;
    return Math.round((correctCount / answers.length) * 100);
  };

  /**
   * Get streak data
   */
  const getStreakData = () => ({
    current: progress.rollingStats.currentStreak,
    max: progress.rollingStats.maxStreak,
  });

  return {
    progress,
    recordAnswer,
    resetProgress,
    resetModeProgress,
    getModeStats,
    getSpeciesStats,
    getRollingAccuracy,
    getStreakData,
  };
}
