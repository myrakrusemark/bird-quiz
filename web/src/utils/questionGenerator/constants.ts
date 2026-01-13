/**
 * Question generator constants
 *
 * Centralized configuration for question generation logic
 */

/** Maximum retry attempts when generating questions with insufficient media */
export const MAX_GENERATION_ATTEMPTS = 10;

/** Minimum number of birds required to generate a valid question */
export const MIN_BIRDS_FOR_QUESTION = 4;

/** Number of wrong answers to include in each question */
export const WRONG_ANSWERS_COUNT = 3;

/** Available question modalities for mixed questions */
export const QUESTION_MODALITIES = ['photo', 'audio'] as const;

/** Available answer types for mixed-modal questions */
export const MIXED_ANSWER_TYPES = ['text', 'text-image', 'image-only', 'audio-only'] as const;

/** Answer types for name-to-media questions (excludes text-based answers) */
export const NAME_TO_MEDIA_ANSWER_TYPES = ['image-only', 'audio-only'] as const;
