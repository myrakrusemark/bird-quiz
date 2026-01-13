/**
 * Bird filtering utilities
 *
 * Filters birds based on available media (photos, recordings) for question generation
 */

import type { Bird, AnswerFormat } from '@/types/bird';

/**
 * Filter birds that have photos
 */
export function filterBirdsWithPhotos(birds: Bird[]): Bird[] {
  return birds.filter(bird => bird.photos.length > 0);
}

/**
 * Filter birds that have recordings
 */
export function filterBirdsWithRecordings(birds: Bird[]): Bird[] {
  return birds.filter(bird => bird.recordings.length > 0);
}

/**
 * Filter birds that have both photos and recordings
 */
export function filterBirdsWithBothMedia(birds: Bird[]): Bird[] {
  return birds.filter(bird =>
    bird.photos.length > 0 && bird.recordings.length > 0
  );
}

/**
 * Filter birds based on answer format requirements
 *
 * @param birds - Array of birds to filter
 * @param answerFormat - Required answer format
 * @returns Filtered array of birds that meet the requirements
 */
export function filterBirdsByAnswerFormat(
  birds: Bird[],
  answerFormat: AnswerFormat
): Bird[] {
  switch (answerFormat) {
    case 'photo':
      return filterBirdsWithPhotos(birds);
    case 'audio':
      return filterBirdsWithRecordings(birds);
    case 'text':
    case 'mixed':
      // All birds are valid for text and mixed answers
      return birds;
    default:
      return birds;
  }
}
