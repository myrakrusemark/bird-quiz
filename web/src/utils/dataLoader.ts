import type { Bird, BirdDataset, BirdRecording, BirdPhoto, RegionConfig } from '@/types/bird';

// Configurable base URL for media assets (for CDN/R2 hosting)
// In production, set VITE_MEDIA_URL to your CDN URL (e.g., https://media.example.com)
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL || '';

// Cache for loaded data (single unified dataset)
let cachedBirdData: BirdDataset | null = null;

/**
 * Load unified bird dataset
 */
export async function loadBirdData(): Promise<BirdDataset> {
  // Check cache first
  if (cachedBirdData) {
    return cachedBirdData;
  }

  try {
    const response = await fetch('/data/birds.json');
    if (!response.ok) {
      throw new Error(`Failed to load bird data: ${response.statusText}`);
    }
    const data: BirdDataset = await response.json();

    // Cache the loaded data
    cachedBirdData = data;
    return data;
  } catch (error) {
    console.error('Error loading bird data:', error);
    throw error;
  }
}

/**
 * Clear cached data (useful for forcing reload)
 */
export function clearCache(): void {
  cachedBirdData = null;
}

/**
 * Filter birds by region species list
 *
 * @param birds - Array of all birds
 * @param speciesIds - Array of species IDs to include
 */
export function filterBirdsByRegion(birds: Bird[], speciesIds: string[]): Bird[] {
  const idSet = new Set(speciesIds);
  return birds.filter(bird => idSet.has(bird.id));
}

/**
 * Get all bird species, optionally filtered by region
 *
 * @param regionConfig - Optional region config. If provided, filters birds by region's species list.
 */
export async function getAllBirds(regionConfig?: RegionConfig): Promise<Bird[]> {
  const data = await loadBirdData();

  if (regionConfig && regionConfig.species) {
    return filterBirdsByRegion(data.species, regionConfig.species);
  }

  return data.species;
}

/**
 * Get a random subset of birds
 *
 * @param count - Number of birds to return
 * @param regionConfig - Optional region config
 */
export async function getRandomBirds(count: number = 10, regionConfig?: RegionConfig): Promise<Bird[]> {
  const allBirds = await getAllBirds(regionConfig);
  return shuffleArray([...allBirds]).slice(0, count);
}

/**
 * Get a specific bird by ID
 *
 * @param id - Bird ID to find
 * @param regionConfig - Optional region config
 */
export async function getBirdById(id: string, regionConfig?: RegionConfig): Promise<Bird | undefined> {
  const allBirds = await getAllBirds(regionConfig);
  return allBirds.find(bird => bird.id === id);
}

/**
 * Get bird photo URL (uses MEDIA_BASE_URL for CDN support)
 */
export function getBirdPhotoUrl(bird: Bird): string {
  if (bird.photos.length === 0) {
    return '/placeholder-bird.jpg'; // Fallback
  }
  return `${MEDIA_BASE_URL}/${bird.photos[0].cached}`;
}

/**
 * Get a random photo from a bird (similar to getRandomRecording)
 */
export function getRandomPhoto(bird: Bird): string {
  if (bird.photos.length === 0) {
    return '/placeholder-bird.jpg'; // Fallback
  }
  const randomIndex = Math.floor(Math.random() * bird.photos.length);
  return `${MEDIA_BASE_URL}/${bird.photos[randomIndex].cached}`;
}

/**
 * Get recording audio URL
 */
export function getRecordingAudioUrl(recording: BirdRecording): string {
  return `${MEDIA_BASE_URL}/${recording.cachedAudio}`;
}

/**
 * Get full URL from a cached path (adds MEDIA_BASE_URL prefix)
 */
export function getMediaUrl(cachedPath: string): string {
  return `${MEDIA_BASE_URL}/${cachedPath}`;
}

/**
 * Get photo URL from a BirdPhoto object
 */
export function getPhotoUrl(photo: BirdPhoto): string {
  return `${MEDIA_BASE_URL}/${photo.cached}`;
}

/**
 * Get recording spectrogram URL
 */
export function getRecordingSpectrogramUrl(recording: BirdRecording): string {
  return `${MEDIA_BASE_URL}/${recording.cachedSpectrogram}`;
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
  const availablePhotos = bird.photos.filter((photo: BirdPhoto) => `${MEDIA_BASE_URL}/${photo.cached}` !== excludeUrl);

  // If no alternative photos available, return null
  if (availablePhotos.length === 0) {
    return null;
  }

  // Select random from remaining photos
  const randomIndex = Math.floor(Math.random() * availablePhotos.length);
  return `${MEDIA_BASE_URL}/${availablePhotos[randomIndex].cached}`;
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
