/**
 * Photo+Audio-to-name question generator
 *
 * Generates questions that show both photo and audio simultaneously
 */

import type { Bird, Question, AnswerFormat } from '@/types/bird';
import {
  getRandomPhoto,
  getRandomRecording,
  getRecordingAudioUrl,
  getWrongAnswers
} from '@/utils/dataLoader';
import { createAnswerOptions } from '../options/createAnswerOptions';
import { filterBirdsWithBothMedia } from '../validation/filterBirdsByMedia';
import { MIN_BIRDS_FOR_QUESTION } from '../constants';

/**
 * Generate a photo+audio-to-name question
 *
 * @param birds - Array of available birds
 * @param answerFormat - Format for answer options
 * @returns Question object or null if generation fails
 */
export function generatePhotoAudioToNameQuestion(
  birds: Bird[],
  answerFormat: AnswerFormat
): Question | null {
  if (birds.length < MIN_BIRDS_FOR_QUESTION) return null;

  // Filter birds that have both photos and recordings
  const birdsWithMedia = filterBirdsWithBothMedia(birds);
  if (birdsWithMedia.length < 1) return null;

  // Select correct bird
  const correctBird = birdsWithMedia[Math.floor(Math.random() * birdsWithMedia.length)];
  const recording = getRandomRecording(correctBird);

  if (!recording) return null;

  const photoUrl = getRandomPhoto(correctBird);
  const audioUrl = getRecordingAudioUrl(recording);

  // Get wrong answers
  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  // Create answer options (exclude both photo and audio)
  const options = createAnswerOptions(answerFormat, {
    correctBird,
    wrongBirds,
    excludePhotoUrl: photoUrl,
    excludeAudioUrl: audioUrl,
  });

  if (!options) return null;

  return {
    id: `photo-audio-${Date.now()}`,
    mode: 'mixed',
    questionType: 'photo-audio-to-name',
    answerFormat,
    bird: correctBird,
    recording,
    questionText: 'What bird is this?',
    correctAnswer: correctBird.id,
    options,
    mediaUrl: photoUrl,
    mediaType: 'photo',
    secondaryMediaUrl: audioUrl,
    secondaryMediaType: 'audio'
  };
}
