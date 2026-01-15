/**
 * Name-to-media question generator
 *
 * Generates questions that show bird name and ask user to identify correct media
 */

import type { Bird, Question, AnswerFormat } from '@/types/bird';
import { getWrongAnswers } from '@/utils/dataLoader';
import { createAnswerOptions } from '../options/createAnswerOptions';
import { filterBirdsByAnswerFormat } from '../validation/filterBirdsByMedia';
import { MIN_BIRDS_FOR_QUESTION } from '../constants';

/**
 * Generate a name-to-media question
 *
 * @param birds - Array of available birds
 * @param answerFormat - Format for answer options
 * @returns Question object or null if generation fails
 */
export function generateNameToMediaQuestion(
  birds: Bird[],
  answerFormat: AnswerFormat
): Question | null {
  if (birds.length < MIN_BIRDS_FOR_QUESTION) return null;

  // IMPORTANT: 'text' answer format doesn't make sense for name-to-media questions
  // (showing text question with text answers would be redundant)
  if (answerFormat === 'text') {
    return null;
  }

  // Filter birds based on answer format requirements
  const validBirds = filterBirdsByAnswerFormat(birds, answerFormat);

  if (validBirds.length < MIN_BIRDS_FOR_QUESTION) return null;

  // Select correct bird
  const correctBird = validBirds[Math.floor(Math.random() * validBirds.length)];

  // Get wrong answers from valid birds
  const wrongBirds = getWrongAnswers(validBirds, correctBird, 3);

  // Create answer options (this is a name-to-media question)
  const options = createAnswerOptions(answerFormat, {
    correctBird,
    wrongBirds,
    isNameToMediaQuestion: true,
  });

  if (!options) return null;

  // Determine question text based on answer format
  let questionText = '';
  switch (answerFormat) {
    case 'photo':
      questionText = 'Which photo shows the...';
      break;
    case 'audio':
      questionText = 'Which sound belongs to the...';
      break;
    case 'mixed':
      questionText = 'Which answer shows the...';
      break;
    default:
      // Should never happen since we filter out 'text' format above
      questionText = 'Which answer shows the...';
      break;
  }

  return {
    id: `name-to-media-${Date.now()}`,
    mode: 'mixed',
    questionType: 'name-to-media',
    answerFormat,
    bird: correctBird,
    questionText,
    correctAnswer: correctBird.id,
    options
  };
}
