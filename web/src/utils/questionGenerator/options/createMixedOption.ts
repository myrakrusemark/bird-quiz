/**
 * Mixed option creator
 *
 * Creates multi-modal answer options (text, text+image, image-only, audio-only)
 * with media exclusion logic to prevent duplicate content
 */

import type { Bird, QuestionOption } from '@/types/bird';
import type { CreateMixedOptionParams, BirdRecording } from '../types';
import {
  getRandomPhoto,
  getRandomPhotoDifferentFrom,
  getRecordingAudioUrl,
  getRandomRecordingDifferentFrom,
} from '@/utils/dataLoader';

/**
 * Create a mixed-modal answer option
 *
 * @param params - Parameters for creating the option
 * @returns QuestionOption with appropriate media based on type
 */
export function createMixedOption(params: CreateMixedOptionParams): QuestionOption {
  const { bird, type, recording, excludePhotoUrl, excludeAudioUrl, hideLabel = false } = params;

  switch (type) {
    case 'text':
      return createTextOption(bird, hideLabel);

    case 'text-image':
      return createTextImageOption(bird, excludePhotoUrl, hideLabel);

    case 'image-only':
      return createImageOnlyOption(bird, excludePhotoUrl, hideLabel);

    case 'audio-only':
      return createAudioOnlyOption(bird, recording, excludeAudioUrl, hideLabel);
  }
}

/**
 * Create text-only option
 */
function createTextOption(bird: Bird, hideLabel: boolean): QuestionOption {
  return {
    id: bird.id,
    label: bird.commonName,
    type: 'text',
    hideLabel,
  };
}

/**
 * Create text + image option
 *
 * Downgrades to text-only if no alternative photo available
 */
function createTextImageOption(
  bird: Bird,
  excludePhotoUrl: string | undefined,
  hideLabel: boolean
): QuestionOption {
  let imageUrl: string;

  // If we need to exclude a photo, get a different one first
  if (excludePhotoUrl) {
    const alternativePhoto = getRandomPhotoDifferentFrom(bird, excludePhotoUrl);

    // If no alternative available, downgrade to text-only
    if (alternativePhoto === null) {
      return createTextOption(bird, hideLabel);
    }

    imageUrl = alternativePhoto;
  } else {
    imageUrl = getRandomPhoto(bird);
  }

  return {
    id: bird.id,
    imageUrl,
    label: bird.commonName,
    type: 'text-image',
    hideLabel,
  };
}

/**
 * Create image-only option
 *
 * Downgrades to text-only if no alternative photo available
 */
function createImageOnlyOption(
  bird: Bird,
  excludePhotoUrl: string | undefined,
  hideLabel: boolean
): QuestionOption {
  let imageUrl: string;

  // If we need to exclude a photo, get a different one first
  if (excludePhotoUrl) {
    const alternativePhoto = getRandomPhotoDifferentFrom(bird, excludePhotoUrl);

    // If no alternative available, downgrade to text-only
    if (alternativePhoto === null) {
      return createTextOption(bird, hideLabel);
    }

    imageUrl = alternativePhoto;
  } else {
    imageUrl = getRandomPhoto(bird);
  }

  return {
    id: bird.id,
    imageUrl,
    label: bird.commonName,
    type: 'image-only',
    hideLabel: hideLabel !== undefined ? hideLabel : true,  // Default to hidden for image-only
  };
}

/**
 * Create audio-only option
 *
 * Downgrades to text-only if no alternative recording available
 */
function createAudioOnlyOption(
  bird: Bird,
  recording: BirdRecording | null,
  excludeAudioUrl: string | undefined,
  hideLabel: boolean
): QuestionOption {
  let audioRecording: BirdRecording | null;

  // If we need to exclude an audio, get a different one first
  if (excludeAudioUrl) {
    if (!recording) {
      // No recording available at all, downgrade to text
      return createTextOption(bird, hideLabel);
    }

    const alternativeRecording = getRandomRecordingDifferentFrom(bird, excludeAudioUrl);

    // If no alternative available, downgrade to text-only
    if (alternativeRecording === null) {
      return createTextOption(bird, hideLabel);
    }

    audioRecording = alternativeRecording;
  } else {
    audioRecording = recording;
  }

  return {
    id: bird.id,
    audioUrl: audioRecording ? getRecordingAudioUrl(audioRecording) : undefined,
    label: bird.commonName,
    type: 'audio-only',
    hideLabel: hideLabel !== undefined ? hideLabel : true,  // Default to hidden for audio-only
  };
}
