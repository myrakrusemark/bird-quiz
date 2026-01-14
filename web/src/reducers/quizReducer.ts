/**
 * Quiz Reducer
 *
 * Manages the unified quiz state including birds data, current question,
 * progress tracking, and settings.
 */

import type { Bird, Question, QuizSettings, Progress, RegionConfig } from '@/types/bird';
import type { QuizAction } from '@/types/actions';
import { generateQuestion } from '@/utils/questionGenerator';
import { calculateAccuracy } from '@/utils/scoring';

const ROLLING_BUFFER_SIZE = 20;

export interface QuizState {
  // Birds data
  birds: Bird[];
  birdsLoading: boolean;
  birdsError: string | null;

  // Current quiz state
  currentQuestion: Question | null;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;

  // Progress tracking
  progress: Progress;

  // Settings
  settings: QuizSettings;

  // Region management
  currentRegion: RegionConfig | null;
  availableRegions: RegionConfig[];
  regionsLoading: boolean;
  regionsError: string | null;

  // UI state
  settingsOpen: boolean;
}

const DEFAULT_SETTINGS: QuizSettings = {
  enabledQuestionTypes: ['mixed'],
  enabledAnswerFormats: ['mixed'],
  selectedRegion: 'missouri',
};

const DEFAULT_PROGRESS: Progress = {
  overallStats: {
    totalQuestions: 0,
    correct: 0,
    accuracy: 0,
    lastPlayed: new Date().toISOString(),
  },
  modeStats: { correct: 0, total: 0 },
  speciesStats: {},
  rollingStats: {
    answers: [],
    currentStreak: 0,
    maxStreak: 0,
    totalAnswers: 0,
  },
};

export const initialQuizState: QuizState = {
  birds: [],
  birdsLoading: true,
  birdsError: null,
  currentQuestion: null,
  answered: false,
  selectedAnswer: null,
  isCorrect: null,
  progress: DEFAULT_PROGRESS,
  settings: DEFAULT_SETTINGS,
  currentRegion: null,
  availableRegions: [],
  regionsLoading: true,
  regionsError: null,
  settingsOpen: false,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'LOAD_BIRDS_START':
      return {
        ...state,
        birdsLoading: true,
        birdsError: null,
      };

    case 'LOAD_BIRDS_SUCCESS':
      return {
        ...state,
        birds: action.payload,
        birdsLoading: false,
        birdsError: null,
      };

    case 'LOAD_BIRDS_ERROR':
      return {
        ...state,
        birdsLoading: false,
        birdsError: action.payload,
      };

    case 'START_QUIZ':
    case 'GENERATE_QUESTION': {
      const birds = action.type === 'START_QUIZ' ? action.payload : action.payload.birds;
      const question = generateQuestion(birds, state.settings);

      return {
        ...state,
        currentQuestion: question,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
      };
    }

    case 'SET_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
      };

    case 'ANSWER_QUESTION': {
      const { answerId, isCorrect } = action.payload;

      return {
        ...state,
        answered: true,
        selectedAnswer: answerId,
        isCorrect,
      };
    }

    case 'NEXT_QUESTION': {
      const question = generateQuestion(action.payload, state.settings);

      return {
        ...state,
        currentQuestion: question,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
      };
    }

    case 'RECORD_ANSWER': {
      const { speciesId, correct, questionType, answerFormat, timestamp } = action.payload;
      const newProgress = { ...state.progress };

      // Update overall stats
      newProgress.overallStats.totalQuestions += 1;
      if (correct) {
        newProgress.overallStats.correct += 1;
      }
      newProgress.overallStats.accuracy = calculateAccuracy(
        newProgress.overallStats.correct,
        newProgress.overallStats.totalQuestions
      );
      newProgress.overallStats.lastPlayed = timestamp;

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
      newProgress.speciesStats[speciesId].lastSeen = timestamp;

      // Update rolling stats (circular buffer of last 20 answers)
      const newAnswers = [...newProgress.rollingStats.answers];
      if (newAnswers.length >= ROLLING_BUFFER_SIZE) {
        newAnswers.shift(); // Remove oldest
      }
      newAnswers.push({ timestamp, speciesId, correct, questionType, answerFormat });

      // Update streak
      let newStreak = correct ? newProgress.rollingStats.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(newStreak, newProgress.rollingStats.maxStreak);

      newProgress.rollingStats = {
        answers: newAnswers,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        totalAnswers: newProgress.rollingStats.totalAnswers + 1,
      };

      return {
        ...state,
        progress: newProgress,
      };
    }

    case 'UPDATE_SETTINGS': {
      const newSettings = action.payload;

      // If settings changed and we have a current question, regenerate it
      const shouldRegenerate = state.currentQuestion !== null;
      const newQuestion = shouldRegenerate
        ? generateQuestion(state.birds, newSettings)
        : state.currentQuestion;

      return {
        ...state,
        settings: newSettings,
        currentQuestion: newQuestion,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
      };
    }

    case 'TOGGLE_SETTINGS_MODAL':
      return {
        ...state,
        settingsOpen: action.payload !== undefined ? action.payload : !state.settingsOpen,
      };

    case 'RESET_QUIZ':
      return {
        ...initialQuizState,
        birds: state.birds,
        progress: state.progress,
        settings: state.settings,
        currentRegion: state.currentRegion,
        availableRegions: state.availableRegions,
      };

    case 'LOAD_REGIONS_START':
      return {
        ...state,
        regionsLoading: true,
        regionsError: null,
      };

    case 'LOAD_REGIONS_SUCCESS':
      return {
        ...state,
        availableRegions: action.payload.regions,
        regionsLoading: false,
        regionsError: null,
      };

    case 'LOAD_REGIONS_ERROR':
      return {
        ...state,
        regionsLoading: false,
        regionsError: action.payload,
      };

    case 'CHANGE_REGION':
      return {
        ...state,
        currentRegion: action.payload,
        // Reset quiz state when changing regions
        currentQuestion: null,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
      };

    default:
      return state;
  }
}
