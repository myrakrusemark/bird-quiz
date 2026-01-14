/**
 * Frontend configuration constants
 *
 * Centralized configuration for quiz behavior and storage
 */

/** LocalStorage keys */
export const STORAGE_KEYS = {
  PROGRESS: 'birdQuizProgress',
  SETTINGS: 'birdQuizSettings',
  SELECTED_REGION: 'birdQuizSelectedRegion',
} as const;

/** Quiz configuration */
export const QUIZ_CONFIG = {
  /** Size of rolling accuracy window (number of recent answers to track) */
  ROLLING_WINDOW_SIZE: 20,

  /** Default number of birds to load */
  DEFAULT_BIRD_COUNT: 20,

  /** Number of wrong answer options per question */
  WRONG_ANSWERS_COUNT: 3,
} as const;

/** Default quiz settings */
export const DEFAULT_QUIZ_SETTINGS = {
  enabledQuestionTypes: ['photo-to-name', 'audio-to-name', 'mixed'] as const,
  enabledAnswerFormats: ['text', 'mixed'] as const,
  selectedRegion: 'missouri',
} as const;
