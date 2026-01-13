/**
 * Question Generator Module
 *
 * Main entry point for generating quiz questions with multiple modalities
 * and answer formats. Includes retry logic for cases with insufficient media.
 */

import type { Bird, Question, QuizSettings } from '@/types/bird';
import { MAX_GENERATION_ATTEMPTS, MIN_BIRDS_FOR_QUESTION } from './constants';
import { generatePhotoToNameQuestion } from './generators/photoToName';
import { generateAudioToNameQuestion } from './generators/audioToName';
import { generatePhotoAudioToNameQuestion } from './generators/photoAudioToName';
import { generateNameToMediaQuestion } from './generators/nameToMedia';
import { generateMixedQuestion } from './generators/mixed';

/**
 * Generate a question based on quiz settings
 *
 * Implements retry logic to handle cases where media is insufficient for
 * the selected question type and answer format combination.
 *
 * @param birds - Array of available birds
 * @param settings - Quiz settings with enabled question types and answer formats
 * @returns Question object or null if generation fails after all retries
 */
export function generateQuestion(birds: Bird[], settings: QuizSettings): Question | null {
  if (birds.length < MIN_BIRDS_FOR_QUESTION) return null;

  let attempts = 0;

  while (attempts < MAX_GENERATION_ATTEMPTS) {
    // Pick random question type from enabled types
    const enabledQuestionTypes = settings.enabledQuestionTypes;
    const questionType = enabledQuestionTypes[
      Math.floor(Math.random() * enabledQuestionTypes.length)
    ];

    // Pick random answer format from enabled formats
    const enabledAnswerFormats = settings.enabledAnswerFormats;
    const answerFormat = enabledAnswerFormats[
      Math.floor(Math.random() * enabledAnswerFormats.length)
    ];

    // Try to generate question based on selected types
    let question: Question | null = null;

    try {
      switch (questionType) {
        case 'photo-to-name':
          question = generatePhotoToNameQuestion(birds, answerFormat);
          break;
        case 'audio-to-name':
          question = generateAudioToNameQuestion(birds, answerFormat);
          break;
        case 'photo-audio-to-name':
          question = generatePhotoAudioToNameQuestion(birds, answerFormat);
          break;
        case 'name-to-media':
          question = generateNameToMediaQuestion(birds, answerFormat);
          break;
        case 'mixed':
          question = generateMixedQuestion(birds, answerFormat);
          break;
      }

      if (question !== null) {
        return question;
      }
    } catch (error) {
      console.warn(`Error generating ${questionType} with ${answerFormat} format:`, error);
    }

    attempts++;
    if (attempts < MAX_GENERATION_ATTEMPTS) {
      console.warn(
        `Failed to generate ${questionType} with ${answerFormat} format ` +
        `(attempt ${attempts}/${MAX_GENERATION_ATTEMPTS}), retrying...`
      );
    }
  }

  console.error(`Failed to generate question after ${MAX_GENERATION_ATTEMPTS} attempts`);
  return null;
}

// Re-export legacy functions for backwards compatibility (if needed)
export { generatePhotoToNameQuestion as generatePhotoQuestion } from './generators/photoToName';
export { generateAudioToNameQuestion as generateAudioQuestion } from './generators/audioToName';
export { generateMixedQuestion } from './generators/mixed';
export { generatePhotoAudioToNameQuestion as generatePhotoAudioQuestion } from './generators/photoAudioToName';
export { generateNameToMediaQuestion } from './generators/nameToMedia';
