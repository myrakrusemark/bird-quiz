/**
 * Question generator types
 *
 * Strict type definitions with no 'any' types
 */

import type { Bird } from '@/types/bird';

/** Recording object from bird dataset */
export interface BirdRecording {
  id: string;
  type: string;
  audioUrl: string;
  spectrogramUrl: string;
  quality: string;
  duration: string;
  location: string;
  recordist: string;
  date: string;
  license: string;
  cachedAudio: string;
  cachedSpectrogram: string;
}

/** Mixed answer option type */
export type MixedAnswerType = 'text' | 'text-image' | 'image-only' | 'audio-only';

/** Question modality type */
export type QuestionModality = 'photo' | 'audio';

/** Parameters for creating mixed options */
export interface CreateMixedOptionParams {
  bird: Bird;
  type: MixedAnswerType;
  recording: BirdRecording | null;
  excludePhotoUrl?: string;
  excludeAudioUrl?: string;
  hideLabel?: boolean;
}

/** Parameters for creating answer options */
export interface CreateAnswerOptionsParams {
  correctBird: Bird;
  wrongBirds: Bird[];
  excludePhotoUrl?: string;
  excludeAudioUrl?: string;
  isNameToMediaQuestion?: boolean;
}
