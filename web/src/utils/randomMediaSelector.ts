import type { Bird, BirdPhoto, BirdRecording } from '@/types/bird';

/**
 * Interface for tracking media already used in the current question
 */
export interface UsedMedia {
  photoUrl?: string;
  audioUrl?: string;
}

/**
 * Selects random photo and recording from a bird's media arrays,
 * excluding media already used in the question.
 *
 * @param bird - The bird species to select media from
 * @param usedMedia - Media URLs already used in the question (to exclude)
 * @returns Object with randomly selected photo and recording
 */
export function selectRandomMedia(
  bird: Bird,
  usedMedia: UsedMedia
): {
  photo: BirdPhoto | undefined;
  recording: BirdRecording | undefined;
} {
  // Filter out photos that were used in the question
  const availablePhotos = bird.photos.filter(
    photo => photo.cached !== usedMedia.photoUrl
  );

  // Filter out recordings that were used in the question
  const availableRecordings = bird.recordings.filter(
    recording => recording.cachedAudio !== usedMedia.audioUrl
  );

  // Select random photo (or fallback to first photo if only 1 exists)
  const selectedPhoto = availablePhotos.length > 0
    ? availablePhotos[Math.floor(Math.random() * availablePhotos.length)]
    : bird.photos[0]; // Fallback to any photo if only 1 exists (reuse acceptable)

  // Select random recording (or fallback to first recording if only 1 exists)
  const selectedRecording = availableRecordings.length > 0
    ? availableRecordings[Math.floor(Math.random() * availableRecordings.length)]
    : bird.recordings[0]; // Fallback to any recording if only 1 exists (reuse acceptable)

  return {
    photo: selectedPhoto,
    recording: selectedRecording,
  };
}
