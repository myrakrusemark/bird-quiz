/**
 * Redux-style action types for quiz state management
 */

import type { Bird, Question, QuizSettings, AnswerRecord } from './bird';

// Action types
export type QuizAction =
  | { type: 'LOAD_BIRDS_START' }
  | { type: 'LOAD_BIRDS_SUCCESS'; payload: Bird[] }
  | { type: 'LOAD_BIRDS_ERROR'; payload: string }
  | { type: 'START_QUIZ'; payload: Bird[] }
  | { type: 'GENERATE_QUESTION'; payload: { birds: Bird[] } }
  | { type: 'SET_QUESTION'; payload: Question | null }
  | { type: 'ANSWER_QUESTION'; payload: { answerId: string; isCorrect: boolean } }
  | { type: 'NEXT_QUESTION'; payload: Bird[] }
  | { type: 'UPDATE_SETTINGS'; payload: QuizSettings }
  | { type: 'TOGGLE_SETTINGS_MODAL'; payload?: boolean }
  | { type: 'RECORD_ANSWER'; payload: AnswerRecord }
  | { type: 'RESET_QUIZ' };
