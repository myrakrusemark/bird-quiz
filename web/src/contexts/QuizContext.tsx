/**
 * QuizContext
 *
 * Single source of truth for all quiz state.
 * Provides unified state management using Context + useReducer.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { quizReducer, initialQuizState, type QuizState } from '@/reducers/quizReducer';
import type { QuizAction } from '@/types/actions';
import type { QuizSettings } from '@/types/bird';
import { getAllBirds, getRandomBirds } from '@/utils/dataLoader';
import {
  selectRollingAccuracy,
  selectCurrentStreak,
  selectMaxStreak,
  selectTotalAnswers,
  selectOverallAccuracy,
  selectIsQuizReady,
  selectIsLoading,
  selectError,
} from '@/selectors/quizSelectors';
import { STORAGE_KEYS, QUIZ_CONFIG } from '@/config/constants';

interface QuizContextValue {
  // State
  state: QuizState;

  // Actions
  dispatch: React.Dispatch<QuizAction>;

  // Convenience action creators
  loadBirds: (count?: number) => void;
  startQuiz: () => void;
  answerQuestion: (answerId: string) => void;
  nextQuestion: () => void;
  updateSettings: (settings: QuizSettings) => void;
  toggleSettingsModal: (open?: boolean) => void;
  resetQuiz: () => void;

  // Memoized selectors
  rollingAccuracy: number;
  currentStreak: number;
  maxStreak: number;
  totalAnswers: number;
  overallAccuracy: number;
  isQuizReady: boolean;
  isLoading: boolean;
  error: string | null;
}

const QuizContext = createContext<QuizContextValue | null>(null);

interface QuizProviderProps {
  children: ReactNode;
  birdCount?: number;
}

export function QuizProvider({ children, birdCount = QUIZ_CONFIG.DEFAULT_BIRD_COUNT }: QuizProviderProps) {
  // Load initial state from localStorage
  const loadInitialState = useCallback((): QuizState => {
    const state = { ...initialQuizState };

    // Load progress
    try {
      const storedProgress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress);

        // Migrate old format if needed
        if (parsed.modeStats && typeof parsed.modeStats === 'object') {
          if ('mixed' in parsed.modeStats) {
            parsed.modeStats = parsed.modeStats.mixed;
          }
        }

        // Add rollingStats if missing
        if (!parsed.rollingStats) {
          parsed.rollingStats = {
            answers: [],
            currentStreak: 0,
            maxStreak: 0,
            totalAnswers: 0,
          };
        }

        state.progress = parsed;
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error);
    }

    // Load settings
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        state.settings = JSON.parse(storedSettings);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }

    return state;
  }, []);

  const [state, dispatch] = useReducer(quizReducer, null, loadInitialState);

  // Save progress to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(state.progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  }, [state.progress]);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [state.settings]);

  // Load birds on mount
  useEffect(() => {
    loadBirds(birdCount);
  }, [birdCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Action creators
  const loadBirds = useCallback(async (count?: number) => {
    dispatch({ type: 'LOAD_BIRDS_START' });

    try {
      const birds = count ? await getRandomBirds(count) : await getAllBirds();
      dispatch({ type: 'LOAD_BIRDS_SUCCESS', payload: birds });

      // Auto-start quiz when birds are loaded
      if (birds.length > 0) {
        dispatch({ type: 'START_QUIZ', payload: birds });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load birds';
      dispatch({ type: 'LOAD_BIRDS_ERROR', payload: errorMessage });
    }
  }, []);

  const startQuiz = useCallback(() => {
    if (state.birds.length > 0) {
      dispatch({ type: 'START_QUIZ', payload: state.birds });
    }
  }, [state.birds]);

  const answerQuestion = useCallback(
    (answerId: string) => {
      if (!state.currentQuestion) return;

      const isCorrect = answerId === state.currentQuestion.correctAnswer;

      // Dispatch answer action
      dispatch({ type: 'ANSWER_QUESTION', payload: { answerId, isCorrect } });

      // Record answer in progress
      dispatch({
        type: 'RECORD_ANSWER',
        payload: {
          timestamp: new Date().toISOString(),
          speciesId: state.currentQuestion.bird.id,
          correct: isCorrect,
          questionType: state.currentQuestion.questionType,
          answerFormat: state.currentQuestion.answerFormat,
        },
      });
    },
    [state.currentQuestion]
  );

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION', payload: state.birds });
  }, [state.birds]);

  const updateSettings = useCallback((settings: QuizSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const toggleSettingsModal = useCallback((open?: boolean) => {
    dispatch({ type: 'TOGGLE_SETTINGS_MODAL', payload: open });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, []);

  // Memoized selectors
  const rollingAccuracy = useMemo(() => selectRollingAccuracy(state), [state.progress.rollingStats.answers]);
  const currentStreak = useMemo(() => selectCurrentStreak(state), [state.progress.rollingStats.currentStreak]);
  const maxStreak = useMemo(() => selectMaxStreak(state), [state.progress.rollingStats.maxStreak]);
  const totalAnswers = useMemo(() => selectTotalAnswers(state), [state.progress.rollingStats.totalAnswers]);
  const overallAccuracy = useMemo(() => selectOverallAccuracy(state), [state.progress.overallStats.accuracy]);
  const isQuizReady = useMemo(() => selectIsQuizReady(state), [state.birds.length, state.birdsLoading, state.birdsError]);
  const isLoading = useMemo(() => selectIsLoading(state), [state.birdsLoading]);
  const error = useMemo(() => selectError(state), [state.birdsError]);

  const value: QuizContextValue = {
    state,
    dispatch,
    loadBirds,
    startQuiz,
    answerQuestion,
    nextQuestion,
    updateSettings,
    toggleSettingsModal,
    resetQuiz,
    rollingAccuracy,
    currentStreak,
    maxStreak,
    totalAnswers,
    overallAccuracy,
    isQuizReady,
    isLoading,
    error,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

/**
 * Hook to use quiz context
 */
export function useQuizContext() {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error('useQuizContext must be used within QuizProvider');
  }

  return context;
}
