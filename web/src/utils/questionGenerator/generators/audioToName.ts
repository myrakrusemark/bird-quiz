/**
 * Audio-to-name question generator
 *
 * Generates questions that play audio and ask user to identify the bird
 */

import type { Bird, Question, AnswerFormat } from '@/types/bird';
import {
  getRandomRecording,
  getRecordingAudioUrl,
  getWrongAnswers
} from '@/utils/dataLoader';
import { createAnswerOptions } from '../options/createAnswerOptions';
import { filterBirdsWithRecordings } from '../validation/filterBirdsByMedia';
import { MIN_BIRDS_FOR_QUESTION } from '../constants';

/**
 * Generate an audio-to-name question
 *
 * @param birds - Array of available birds
 * @param answerFormat - Format for answer options
 * @returns Question object or null if generation fails
 */
export function generateAudioToNameQuestion(
  birds: Bird[],
  answerFormat: AnswerFormat
): Question | null {
  if (birds.length < MIN_BIRDS_FOR_QUESTION) return null;

  // Filter birds that have recordings
  const birdsWithAudio = filterBirdsWithRecordings(birds);
  if (birdsWithAudio.length < 1) return null;

  // Select correct bird
  const correctBird = birdsWithAudio[Math.floor(Math.random() * birdsWithAudio.length)];
  const recording = getRandomRecording(correctBird);

  if (!recording) return null;

  const audioUrl = getRecordingAudioUrl(recording);

  // Get wrong answers
  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  // Create answer options
  const options = createAnswerOptions(answerFormat, {
    correctBird,
    wrongBirds,
    excludeAudioUrl: audioUrl,
  });

  if (!options) return null;

  return {
    id: `audio-${Date.now()}`,
    mode: 'mixed',
    questionType: 'audio-to-name',
    answerFormat,
    bird: correctBird,
    recording,
    questionText: 'Which bird makes this sound?',
    correctAnswer: correctBird.id,
    options,
    mediaUrl: audioUrl,
    mediaType: 'audio',
  };
}
