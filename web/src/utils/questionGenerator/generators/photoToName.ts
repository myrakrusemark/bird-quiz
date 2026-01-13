/**
 * Photo-to-name question generator
 *
 * Generates questions that show a photo and ask user to identify the bird
 */

import type { Bird, Question, AnswerFormat } from '@/types/bird';
import { getRandomPhoto, getWrongAnswers } from '@/utils/dataLoader';
import { createAnswerOptions } from '../options/createAnswerOptions';
import { filterBirdsWithPhotos } from '../validation/filterBirdsByMedia';
import { MIN_BIRDS_FOR_QUESTION } from '../constants';

/**
 * Generate a photo-to-name question
 *
 * @param birds - Array of available birds
 * @param answerFormat - Format for answer options
 * @returns Question object or null if generation fails
 */
export function generatePhotoToNameQuestion(
  birds: Bird[],
  answerFormat: AnswerFormat
): Question | null {
  if (birds.length < MIN_BIRDS_FOR_QUESTION) return null;

  // Filter birds that have photos
  const birdsWithPhotos = filterBirdsWithPhotos(birds);
  if (birdsWithPhotos.length < 1) return null;

  // Select correct bird
  const correctBird = birdsWithPhotos[Math.floor(Math.random() * birdsWithPhotos.length)];
  const photoUrl = getRandomPhoto(correctBird);

  // Get wrong answers
  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  // Create answer options
  const options = createAnswerOptions(answerFormat, {
    correctBird,
    wrongBirds,
    excludePhotoUrl: photoUrl,
  });

  if (!options) return null;

  return {
    id: `photo-${Date.now()}`,
    mode: 'mixed',
    questionType: 'photo-to-name',
    answerFormat,
    bird: correctBird,
    questionText: 'What bird is this?',
    correctAnswer: correctBird.id,
    options,
    mediaUrl: photoUrl,
    mediaType: 'photo',
  };
}
