/**
 * Answer options creator
 *
 * Creates complete sets of answer options based on answer format
 */

import type { Bird, QuestionOption, AnswerFormat } from '@/types/bird';
import type { CreateAnswerOptionsParams, BirdRecording } from '../types';
import {
  getRandomPhoto,
  getRandomPhotoDifferentFrom,
  getRandomRecording,
  getRecordingAudioUrl,
  getRandomRecordingDifferentFrom,
  shuffleArray,
} from '@/utils/dataLoader';
import { createMixedOption } from './createMixedOption';
import { MIXED_ANSWER_TYPES, NAME_TO_MEDIA_ANSWER_TYPES } from '../constants';

/**
 * Create answer options based on the specified answer format
 *
 * @param answerFormat - Format for answer options (text, photo, audio, mixed)
 * @param params - Parameters including correct and wrong birds, exclusions
 * @returns Array of shuffled QuestionOptions, or null if generation fails
 */
export function createAnswerOptions(
  answerFormat: AnswerFormat,
  params: CreateAnswerOptionsParams
): QuestionOption[] | null {
  const { correctBird, wrongBirds, excludePhotoUrl, excludeAudioUrl, isNameToMediaQuestion } = params;

  // Combine correct and wrong birds for processing
  const allBirds = [correctBird, ...wrongBirds];

  switch (answerFormat) {
    case 'text':
      return createTextOptions(allBirds);

    case 'photo':
      return createPhotoOptions(allBirds, correctBird, excludePhotoUrl);

    case 'audio':
      return createAudioOptions(allBirds, correctBird, excludeAudioUrl);

    case 'mixed':
      return createMixedOptions(allBirds, correctBird, excludePhotoUrl, excludeAudioUrl, isNameToMediaQuestion);
  }
}

/**
 * Create all text-only answer options
 */
function createTextOptions(allBirds: Bird[]): QuestionOption[] {
  const options: QuestionOption[] = [];

  for (const bird of allBirds) {
    options.push({
      id: bird.id,
      label: bird.commonName,
      type: 'text'
    });
  }

  return shuffleArray(options);
}

/**
 * Create all photo answer options (image-only)
 */
function createPhotoOptions(
  allBirds: Bird[],
  correctBird: Bird,
  excludePhotoUrl?: string
): QuestionOption[] | null {
  const options: QuestionOption[] = [];

  for (const bird of allBirds) {
    let imageUrl: string;

    // Handle exclusion for correct bird
    if (bird.id === correctBird.id && excludePhotoUrl) {
      const alternativePhoto = getRandomPhotoDifferentFrom(bird, excludePhotoUrl);
      if (alternativePhoto === null) {
        // Fallback to text if no alternative photo available
        return null;
      }
      imageUrl = alternativePhoto;
    } else {
      imageUrl = getRandomPhoto(bird);
      if (!imageUrl) {
        return null; // Can't generate photo answers if bird has no photos
      }
    }

    options.push({
      id: bird.id,
      imageUrl,
      label: bird.commonName,
      type: 'image-only',
      hideLabel: true
    });
  }

  return shuffleArray(options);
}

/**
 * Create all audio answer options (audio-only)
 */
function createAudioOptions(
  allBirds: Bird[],
  correctBird: Bird,
  excludeAudioUrl?: string
): QuestionOption[] | null {
  const options: QuestionOption[] = [];

  for (const bird of allBirds) {
    const recording = getRandomRecording(bird);

    if (!recording) {
      return null; // Can't generate audio answers if bird has no recordings
    }

    let audioUrl: string;

    // Handle exclusion for correct bird
    if (bird.id === correctBird.id && excludeAudioUrl) {
      const alternativeRecording = getRandomRecordingDifferentFrom(bird, excludeAudioUrl);
      if (alternativeRecording === null) {
        return null;
      }
      audioUrl = getRecordingAudioUrl(alternativeRecording);
    } else {
      audioUrl = getRecordingAudioUrl(recording);
    }

    options.push({
      id: bird.id,
      audioUrl,
      label: bird.commonName,
      type: 'audio-only',
      hideLabel: true
    });
  }

  return shuffleArray(options);
}

/**
 * Create mixed answer options (random mix of types)
 */
function createMixedOptions(
  allBirds: Bird[],
  correctBird: Bird,
  excludePhotoUrl?: string,
  excludeAudioUrl?: string,
  isNameToMediaQuestion?: boolean
): QuestionOption[] {
  const options: QuestionOption[] = [];

  // For name-to-media questions, exclude text-based answers since the question already shows the bird name
  const answerTypes = isNameToMediaQuestion ? NAME_TO_MEDIA_ANSWER_TYPES : MIXED_ANSWER_TYPES;

  for (const bird of allBirds) {
    const randomType = answerTypes[Math.floor(Math.random() * answerTypes.length)];
    const recording = getRandomRecording(bird) as BirdRecording | null;

    // Use existing createMixedOption function
    const isCorrectBird = bird.id === correctBird.id;
    const option = createMixedOption({
      bird,
      type: randomType,
      recording,
      excludePhotoUrl: isCorrectBird ? excludePhotoUrl : undefined,
      excludeAudioUrl: isCorrectBird ? excludeAudioUrl : undefined,
    });

    options.push(option);
  }

  return shuffleArray(options);
}
