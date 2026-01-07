import type { Bird, Question, QuestionOption, LearningMode } from '@/types/bird';
import {
  getBirdPhotoUrl,
  getRandomPhoto,
  getRecordingAudioUrl,
  getRandomRecording,
  getRandomPhotoDifferentFrom,
  getRandomRecordingDifferentFrom,
  shuffleArray,
  getWrongAnswers,
} from './dataLoader';

/**
 * Generate a Photo → Name question
 */
export function generatePhotoQuestion(birds: Bird[]): Question | null {
  if (birds.length < 4) return null;

  const correctBird = birds[Math.floor(Math.random() * birds.length)];
  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  const options: QuestionOption[] = shuffleArray([
    {
      id: correctBird.id,
      label: correctBird.commonName,
      type: 'text' as const,
    },
    ...wrongBirds.map(bird => ({
      id: bird.id,
      label: bird.commonName,
      type: 'text' as const,
    })),
  ]);

  return {
    id: `photo-${Date.now()}`,
    mode: 'photo',
    bird: correctBird,
    questionText: 'What bird is this?',
    correctAnswer: correctBird.id,
    options,
    mediaUrl: getRandomPhoto(correctBird),
    mediaType: 'photo',
  };
}

/**
 * Generate an Audio → Name question
 */
export function generateAudioQuestion(birds: Bird[]): Question | null {
  if (birds.length < 4) return null;

  const correctBird = birds[Math.floor(Math.random() * birds.length)];
  const recording = getRandomRecording(correctBird);

  if (!recording) return null;

  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  const options: QuestionOption[] = shuffleArray([
    {
      id: correctBird.id,
      label: correctBird.commonName,
      type: 'text' as const,
    },
    ...wrongBirds.map(bird => ({
      id: bird.id,
      label: bird.commonName,
      type: 'text' as const,
    })),
  ]);

  return {
    id: `audio-${Date.now()}`,
    mode: 'audio',
    bird: correctBird,
    recording,
    questionText: 'Which bird makes this sound?',
    correctAnswer: correctBird.id,
    options,
    mediaUrl: getRecordingAudioUrl(recording),
    mediaType: 'audio',
  };
}

/**
 * Generate a Mixed-Modal question
 * Shows one modality as the question, answers are mixed modalities
 */
export function generateMixedQuestion(birds: Bird[]): Question | null {
  if (birds.length < 4) return null;

  const correctBird = birds[Math.floor(Math.random() * birds.length)];
  const recording = getRandomRecording(correctBird);

  if (!recording) return null;

  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  // Randomly choose question modality
  const questionModalities = ['photo', 'audio'] as const;
  const questionModality = questionModalities[Math.floor(Math.random() * questionModalities.length)];

  let mediaUrl = '';
  let questionText = '';
  let mediaType: 'photo' | 'audio' = 'photo';

  switch (questionModality) {
    case 'photo':
      mediaUrl = getRandomPhoto(correctBird);
      questionText = 'Identify this bird:';
      mediaType = 'photo';
      break;
    case 'audio':
      mediaUrl = getRecordingAudioUrl(recording);
      questionText = 'Which bird makes this sound?';
      mediaType = 'audio';
      break;
  }

  // Mix answer modalities (text, text-image, image-only, audio-only)
  const answerTypes = ['text', 'text-image', 'image-only', 'audio-only'] as const;
  const options: QuestionOption[] = [];

  // Determine what media to exclude from answer options
  const excludePhotoUrl = questionModality === 'photo' ? mediaUrl : undefined;
  const excludeAudioUrl = questionModality === 'audio' ? mediaUrl : undefined;

  // Correct answer (random type)
  const correctType = answerTypes[Math.floor(Math.random() * answerTypes.length)];
  const correctRecording = getRandomRecording(correctBird);

  // Pass exclusions to prevent duplicate media in correct answer
  options.push(createMixedOption(correctBird, correctType, correctRecording, excludePhotoUrl, excludeAudioUrl));

  // Wrong answers (random types) - no exclusions needed since different species
  for (const wrongBird of wrongBirds) {
    const wrongType = answerTypes[Math.floor(Math.random() * answerTypes.length)];
    const wrongRecording = getRandomRecording(wrongBird);
    options.push(createMixedOption(wrongBird, wrongType, wrongRecording));
  }

  return {
    id: `mixed-${Date.now()}`,
    mode: 'mixed',
    bird: correctBird,
    recording,
    questionText,
    correctAnswer: correctBird.id,
    options: shuffleArray(options),
    mediaUrl,
    mediaType,
  };
}

/**
 * Create a mixed-modal answer option
 */
function createMixedOption(
  bird: Bird,
  type: 'text' | 'text-image' | 'image-only' | 'audio-only',
  recording: any,
  excludePhotoUrl?: string,
  excludeAudioUrl?: string
): QuestionOption {
  switch (type) {
    case 'text':
      return {
        id: bird.id,
        label: bird.commonName,
        type: 'text',
      };

    case 'text-image': {
      let imageUrl = getRandomPhoto(bird);

      // If we need to exclude a photo, try to get a different one
      if (excludePhotoUrl) {
        const alternativePhoto = getRandomPhotoDifferentFrom(bird, excludePhotoUrl);

        // If no alternative available, downgrade to text-only
        if (alternativePhoto === null) {
          return {
            id: bird.id,
            label: bird.commonName,
            type: 'text',
          };
        }

        imageUrl = alternativePhoto;
      }

      return {
        id: bird.id,
        imageUrl,
        label: bird.commonName,
        type: 'text-image',
      };
    }

    case 'image-only': {
      let imageUrl = getRandomPhoto(bird);

      // If we need to exclude a photo, try to get a different one
      if (excludePhotoUrl) {
        const alternativePhoto = getRandomPhotoDifferentFrom(bird, excludePhotoUrl);

        // If no alternative available, downgrade to text-only
        if (alternativePhoto === null) {
          return {
            id: bird.id,
            label: bird.commonName,
            type: 'text',
          };
        }

        imageUrl = alternativePhoto;
      }

      return {
        id: bird.id,
        imageUrl,
        label: bird.commonName,
        type: 'image-only',
        hideLabel: true,  // Hidden until answered
      };
    }

    case 'audio-only': {
      let audioRecording = recording;

      // If we need to exclude an audio, try to get a different one
      if (excludeAudioUrl && recording) {
        const alternativeRecording = getRandomRecordingDifferentFrom(bird, excludeAudioUrl);

        // If no alternative available, downgrade to text-only
        if (alternativeRecording === null) {
          return {
            id: bird.id,
            label: bird.commonName,
            type: 'text',
          };
        }

        audioRecording = alternativeRecording;
      }

      return {
        id: bird.id,
        audioUrl: audioRecording ? getRecordingAudioUrl(audioRecording) : undefined,
        label: bird.commonName,
        type: 'audio-only',
        hideLabel: true,  // Hidden until answered
      };
    }
  }
}

/**
 * Generate a question based on the learning mode
 */
export function generateQuestion(mode: LearningMode, birds: Bird[]): Question | null {
  return generateMixedQuestion(birds);
}
