/**
 * Mixed question generator
 *
 * Generates questions with random combination of photo or audio questions
 */

import type { Bird, Question, AnswerFormat } from '@/types/bird';
import { QUESTION_MODALITIES } from '../constants';
import { generatePhotoToNameQuestion } from './photoToName';
import { generateAudioToNameQuestion } from './audioToName';

/**
 * Generate a mixed question (randomly chooses photo or audio)
 *
 * @param birds - Array of available birds
 * @param answerFormat - Format for answer options
 * @returns Question object or null if generation fails
 */
export function generateMixedQuestion(
  birds: Bird[],
  answerFormat: AnswerFormat
): Question | null {
  // Randomly choose photo or audio for question
  const questionModality = QUESTION_MODALITIES[
    Math.floor(Math.random() * QUESTION_MODALITIES.length)
  ];

  if (questionModality === 'photo') {
    return generatePhotoToNameQuestion(birds, answerFormat);
  } else {
    return generateAudioToNameQuestion(birds, answerFormat);
  }
}
