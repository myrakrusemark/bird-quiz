import type { Bird, BirdDataset, BirdRecording, BirdPhoto } from '@/types/bird';

// Cache for loaded data
let cachedData: BirdDataset | null = null;

/**
 * Load the complete bird dataset from birds.json
 */
export async function loadBirdData(): Promise<BirdDataset> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/data/birds.json');
    if (!response.ok) {
      throw new Error(`Failed to load bird data: ${response.statusText}`);
    }
    const data: BirdDataset = await response.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error('Error loading bird data:', error);
    throw error;
  }
}

/**
 * Get all bird species
 */
export async function getAllBirds(): Promise<Bird[]> {
  const data = await loadBirdData();
  return data.species;
}

/**
 * Get a random subset of birds
 */
export async function getRandomBirds(count: number = 10): Promise<Bird[]> {
  const allBirds = await getAllBirds();
  return shuffleArray([...allBirds]).slice(0, count);
}

/**
 * Get a specific bird by ID
 */
export async function getBirdById(id: string): Promise<Bird | undefined> {
  const allBirds = await getAllBirds();
  return allBirds.find(bird => bird.id === id);
}

/**
 * Get bird photo URL (relative to public directory)
 */
export function getBirdPhotoUrl(bird: Bird): string {
  if (bird.photos.length === 0) {
    return '/placeholder-bird.jpg'; // Fallback
  }
  return `/${bird.photos[0].cached}`;
}

/**
 * Get a random photo from a bird (similar to getRandomRecording)
 */
export function getRandomPhoto(bird: Bird): string {
  if (bird.photos.length === 0) {
    return '/placeholder-bird.jpg'; // Fallback
  }
  const randomIndex = Math.floor(Math.random() * bird.photos.length);
  return `/${bird.photos[randomIndex].cached}`;
}

/**
 * Get recording audio URL
 */
export function getRecordingAudioUrl(recording: BirdRecording): string {
  return `/${recording.cachedAudio}`;
}

/**
 * Get recording spectrogram URL
 */
export function getRecordingSpectrogramUrl(recording: BirdRecording): string {
  return `/${recording.cachedSpectrogram}`;
}

/**
 * Get a random recording from a bird
 */
export function getRandomRecording(bird: Bird): BirdRecording | null {
  if (bird.recordings.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * bird.recordings.length);
  return bird.recordings[randomIndex];
}

/**
 * Get a random photo that's different from the excluded one
 * Returns null if no alternative photo is available (only one photo exists)
 */
export function getRandomPhotoDifferentFrom(bird: Bird, excludeUrl: string): string | null {
  if (bird.photos.length === 0) {
    return null;
  }

  // Filter out the excluded photo
  const availablePhotos = bird.photos.filter((photo: BirdPhoto) => `/${photo.cached}` !== excludeUrl);

  // If no alternative photos available, return null
  if (availablePhotos.length === 0) {
    return null;
  }

  // Select random from remaining photos
  const randomIndex = Math.floor(Math.random() * availablePhotos.length);
  return `/${availablePhotos[randomIndex].cached}`;
}

/**
 * Get a random recording that's different from the excluded one
 * Returns null if no alternative recording is available
 */
export function getRandomRecordingDifferentFrom(bird: Bird, excludeUrl: string): BirdRecording | null {
  if (bird.recordings.length === 0) {
    return null;
  }

  // Filter out the excluded recording
  const availableRecordings = bird.recordings.filter(
    (recording: BirdRecording) => getRecordingAudioUrl(recording) !== excludeUrl
  );

  // If no alternative recordings available, return null
  if (availableRecordings.length === 0) {
    return null;
  }

  // Select random from remaining recordings
  const randomIndex = Math.floor(Math.random() * availableRecordings.length);
  return availableRecordings[randomIndex];
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get multiple random wrong answers (different from correct bird)
 */
export function getWrongAnswers(
  allBirds: Bird[],
  correctBird: Bird,
  count: number = 3
): Bird[] {
  const wrongBirds = allBirds.filter(bird => bird.id !== correctBird.id);
  return shuffleArray(wrongBirds).slice(0, count);
}
