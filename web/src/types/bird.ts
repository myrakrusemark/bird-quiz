// Type definitions for bird dataset

export interface BirdPhoto {
  url: string;
  source: string;
  license: string;
  attribution?: string;  // For Wikimedia Commons attribution
  cached: string;
}

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

export interface BirdStats {
  totalRecordings: number;
  recordingTypes: string[];
  totalPhotos: number;
}

export interface Bird {
  id: string;
  commonName: string;
  scientificName: string;
  region: string;
  description: string;
  photos: BirdPhoto[];
  recordings: BirdRecording[];
  stats: BirdStats;
}

export interface BirdDataset {
  species: Bird[];
  metadata: {
    version: string;
    created: string;
    totalSpecies: number;
    dataSources: string[];
    testMode?: boolean;
  };
}

// Learning mode types
export type LearningMode = 'mixed';

// Question type variations
export type QuestionType =
  | 'photo-to-name'        // Photo → Name (existing)
  | 'audio-to-name'        // Audio → Name (existing)
  | 'photo-audio-to-name'  // Photo + Audio → Name (NEW)
  | 'name-to-media'        // Name → Media (NEW reverse mode)
  | 'mixed';               // Random (existing)

// Answer format variations
export type AnswerFormat =
  | 'text'    // All text answers
  | 'photo'   // All photo answers (image-only)
  | 'audio'   // All audio answers (audio-only)
  | 'mixed';  // Random mix (existing)

// Quiz settings/preferences
export interface QuizSettings {
  enabledQuestionTypes: QuestionType[];
  enabledAnswerFormats: AnswerFormat[];
}

// Question types
export interface QuestionOption {
  id: string;
  label?: string;
  audioUrl?: string;
  imageUrl?: string;
  type: 'text' | 'text-image' | 'image-only' | 'audio-only';
  hideLabel?: boolean;  // Hide label until answered (for image-only and audio-only)
}

export interface Question {
  id: string;
  mode: LearningMode;
  questionType: QuestionType;         // NEW: specific question type
  answerFormat: AnswerFormat;         // NEW: answer format used
  bird: Bird;
  recording?: BirdRecording;
  questionText: string;
  correctAnswer: string;
  options: QuestionOption[];
  mediaUrl?: string;                  // Primary media (photo or audio)
  mediaType?: 'photo' | 'audio';
  secondaryMediaUrl?: string;         // NEW: For photo+audio combined
  secondaryMediaType?: 'photo' | 'audio';  // NEW
}

// Quiz state types
export interface QuizState {
  currentQuestion: Question | null;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  streak: number;
  mode: LearningMode;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
}

// Progress tracking types
export interface ModeStats {
  correct: number;
  total: number;
  accuracy?: number;
}

export interface SpeciesStats {
  correct: number;
  total: number;
  lastSeen?: string;
}

export interface Progress {
  overallStats: {
    totalQuestions: number;
    correct: number;
    accuracy: number;
    lastPlayed: string;
  };
  modeStats: ModeStats;  // Single object since only 'mixed' mode exists
  speciesStats: Record<string, SpeciesStats>;
}
