import type { Bird, Question, QuestionOption, AnswerFormat, QuizSettings } from '@/types/bird';
import {
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
    mode: 'mixed',
    questionType: 'photo-to-name',
    answerFormat: 'text',
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
    mode: 'mixed',
    questionType: 'audio-to-name',
    answerFormat: 'text',
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
    questionType: questionModality === 'photo' ? 'photo-to-name' : 'audio-to-name',
    answerFormat: 'mixed',
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
  excludeAudioUrl?: string,
  hideLabel?: boolean
): QuestionOption {
  switch (type) {
    case 'text':
      return {
        id: bird.id,
        label: bird.commonName,
        type: 'text',
        hideLabel: hideLabel || false,
      };

    case 'text-image': {
      let imageUrl: string;

      // If we need to exclude a photo, get a different one first
      if (excludePhotoUrl) {
        const alternativePhoto = getRandomPhotoDifferentFrom(bird, excludePhotoUrl);

        // If no alternative available, downgrade to text-only
        if (alternativePhoto === null) {
          return {
            id: bird.id,
            label: bird.commonName,
            type: 'text',
            hideLabel: hideLabel || false,
          };
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
        hideLabel: hideLabel || false,
      };
    }

    case 'image-only': {
      let imageUrl: string;

      // If we need to exclude a photo, get a different one first
      if (excludePhotoUrl) {
        const alternativePhoto = getRandomPhotoDifferentFrom(bird, excludePhotoUrl);

        // If no alternative available, downgrade to text-only
        if (alternativePhoto === null) {
          return {
            id: bird.id,
            label: bird.commonName,
            type: 'text',
            hideLabel: hideLabel || false,
          };
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
        hideLabel: hideLabel !== undefined ? hideLabel : true,  // Hidden until answered (or as specified)
      };
    }

    case 'audio-only': {
      let audioRecording: any;

      // If we need to exclude an audio, get a different one first
      if (excludeAudioUrl) {
        if (!recording) {
          // No recording available at all, downgrade to text
          return {
            id: bird.id,
            label: bird.commonName,
            type: 'text',
            hideLabel: hideLabel || false,
          };
        }

        const alternativeRecording = getRandomRecordingDifferentFrom(bird, excludeAudioUrl);

        // If no alternative available, downgrade to text-only
        if (alternativeRecording === null) {
          return {
            id: bird.id,
            label: bird.commonName,
            type: 'text',
            hideLabel: hideLabel || false,
          };
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
        hideLabel: hideLabel !== undefined ? hideLabel : true,  // Hidden until answered (or as specified)
      };
    }
  }
}

/**
 * Generate a Photo + Audio → Name question
 * Shows both photo and audio simultaneously
 */
export function generatePhotoAudioQuestion(birds: Bird[], answerFormat: AnswerFormat): Question | null {
  if (birds.length < 4) return null;

  // Filter birds that have both photos and recordings
  const birdsWithMedia = birds.filter(b => b.photos.length > 0 && b.recordings.length > 0);
  if (birdsWithMedia.length < 1) return null;

  const correctBird = birdsWithMedia[Math.floor(Math.random() * birdsWithMedia.length)];
  const recording = getRandomRecording(correctBird);

  if (!recording) return null;

  const photoUrl = getRandomPhoto(correctBird);
  const audioUrl = getRecordingAudioUrl(recording);

  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  // Create answer options using the specified format
  const options = createAnswerOptions(
    correctBird,
    wrongBirds,
    answerFormat,
    photoUrl,  // Exclude this photo from answers
    audioUrl   // Exclude this audio from answers
  );

  if (!options) return null;

  return {
    id: `photo-audio-${Date.now()}`,
    mode: 'mixed',
    questionType: 'photo-audio-to-name',
    answerFormat,
    bird: correctBird,
    recording,
    questionText: 'What bird is this?',
    correctAnswer: correctBird.id,
    options,
    mediaUrl: photoUrl,
    mediaType: 'photo',
    secondaryMediaUrl: audioUrl,
    secondaryMediaType: 'audio'
  };
}

/**
 * Generate a Name → Media question
 * Shows bird name, user identifies correct media
 */
export function generateNameToMediaQuestion(birds: Bird[], answerFormat: AnswerFormat): Question | null {
  if (birds.length < 4) return null;

  // IMPORTANT: 'text' answer format doesn't make sense for name-to-media questions
  // (showing text question with text answers would be redundant)
  if (answerFormat === 'text') {
    return null;
  }

  // Filter birds based on answer format requirements
  let validBirds: Bird[] = birds;

  if (answerFormat === 'photo') {
    // Need birds with photos
    validBirds = birds.filter(b => b.photos.length > 0);
  } else if (answerFormat === 'audio') {
    // Need birds with recordings
    validBirds = birds.filter(b => b.recordings.length > 0);
  }
  // For 'mixed', all birds are valid

  if (validBirds.length < 4) return null;

  // Select correct bird
  const correctBird = validBirds[Math.floor(Math.random() * validBirds.length)];

  // Get wrong answers from valid birds
  const wrongBirds = getWrongAnswers(validBirds, correctBird, 3);

  // Create answer options
  const options = createAnswerOptions(
    correctBird,
    wrongBirds,
    answerFormat
  );

  if (!options) return null;

  // Determine question text based on answer format
  let questionText = '';
  switch (answerFormat) {
    case 'photo':
      questionText = `Which photo shows the ${correctBird.commonName}?`;
      break;
    case 'audio':
      questionText = `Which sound belongs to the ${correctBird.commonName}?`;
      break;
    case 'mixed':
      questionText = `Which answer shows the ${correctBird.commonName}?`;
      break;
    default:
      // Should never happen since we filter out 'text' format above
      questionText = `Which answer shows the ${correctBird.commonName}?`;
      break;
  }

  return {
    id: `name-to-media-${Date.now()}`,
    mode: 'mixed',
    questionType: 'name-to-media',
    answerFormat,
    bird: correctBird,
    questionText,
    correctAnswer: correctBird.id,
    options
  };
}

/**
 * Create answer options based on the specified answer format
 */
function createAnswerOptions(
  correctBird: Bird,
  wrongBirds: Bird[],
  answerFormat: AnswerFormat,
  excludePhotoUrl?: string,
  excludeAudioUrl?: string
): QuestionOption[] | null {
  const options: QuestionOption[] = [];

  // Combine correct and wrong birds for processing
  const allBirds = [correctBird, ...wrongBirds];

  switch (answerFormat) {
    case 'text': {
      // All text-only answers
      for (const bird of allBirds) {
        options.push({
          id: bird.id,
          label: bird.commonName,
          type: 'text'
        });
      }
      break;
    }

    case 'photo': {
      // All photo answers (image-only)
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
      break;
    }

    case 'audio': {
      // All audio answers (audio-only)
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
      break;
    }

    case 'mixed': {
      // Mixed answer types (random mix) - use existing logic
      const answerTypes = ['text', 'text-image', 'image-only', 'audio-only'] as const;

      for (const bird of allBirds) {
        const randomType = answerTypes[Math.floor(Math.random() * answerTypes.length)];
        const recording = getRandomRecording(bird);

        // Use existing createMixedOption function
        const isCorrectBird = bird.id === correctBird.id;
        const option = createMixedOption(
          bird,
          randomType,
          recording,
          isCorrectBird ? excludePhotoUrl : undefined,
          isCorrectBird ? excludeAudioUrl : undefined
        );

        options.push(option);
      }
      break;
    }
  }

  return shuffleArray(options);
}

/**
 * Generate a question based on quiz settings
 * Implements retry logic to handle cases where media is insufficient
 */
export function generateQuestion(birds: Bird[], settings: QuizSettings): Question | null {
  if (birds.length < 4) return null;

  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Pick random question type from enabled types
    const enabledQuestionTypes = settings.enabledQuestionTypes;
    const questionType = enabledQuestionTypes[Math.floor(Math.random() * enabledQuestionTypes.length)];

    // Pick random answer format from enabled formats
    const enabledAnswerFormats = settings.enabledAnswerFormats;
    const answerFormat = enabledAnswerFormats[Math.floor(Math.random() * enabledAnswerFormats.length)];

    // Try to generate question based on selected types
    let question: Question | null = null;

    try {
      switch (questionType) {
        case 'photo-to-name':
          question = generatePhotoQuestionWithFormat(birds, answerFormat);
          break;
        case 'audio-to-name':
          question = generateAudioQuestionWithFormat(birds, answerFormat);
          break;
        case 'photo-audio-to-name':
          question = generatePhotoAudioQuestion(birds, answerFormat);
          break;
        case 'name-to-media':
          question = generateNameToMediaQuestion(birds, answerFormat);
          break;
        case 'mixed':
          question = generateMixedQuestionWithFormat(birds, answerFormat);
          break;
      }

      if (question !== null) {
        return question;
      }
    } catch (error) {
      console.warn(`Error generating ${questionType} with ${answerFormat} format:`, error);
    }

    attempts++;
    if (attempts < maxAttempts) {
      console.warn(
        `Failed to generate ${questionType} with ${answerFormat} format (attempt ${attempts}/${maxAttempts}), retrying...`
      );
    }
  }

  console.error(`Failed to generate question after ${maxAttempts} attempts`);
  return null;
}

/**
 * Helper: Generate photo question with specified answer format
 */
function generatePhotoQuestionWithFormat(birds: Bird[], answerFormat: AnswerFormat): Question | null {
  if (birds.length < 4) return null;

  const birdsWithPhotos = birds.filter(b => b.photos.length > 0);
  if (birdsWithPhotos.length < 1) return null;

  const correctBird = birdsWithPhotos[Math.floor(Math.random() * birdsWithPhotos.length)];
  const photoUrl = getRandomPhoto(correctBird);
  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  const options = createAnswerOptions(correctBird, wrongBirds, answerFormat, photoUrl);
  if (!options) return null;

  return {
    id: `photo-${Date.now()}`,
    mode: 'mixed',
    questionType: 'photo-to-name',
    answerFormat,
    bird: correctBird,
    questionText: 'What bird is this?',
    correctAnswer: correctBird.id,
    options,
    mediaUrl: photoUrl,
    mediaType: 'photo',
  };
}

/**
 * Helper: Generate audio question with specified answer format
 */
function generateAudioQuestionWithFormat(birds: Bird[], answerFormat: AnswerFormat): Question | null {
  if (birds.length < 4) return null;

  const birdsWithAudio = birds.filter(b => b.recordings.length > 0);
  if (birdsWithAudio.length < 1) return null;

  const correctBird = birdsWithAudio[Math.floor(Math.random() * birdsWithAudio.length)];
  const recording = getRandomRecording(correctBird);

  if (!recording) return null;

  const audioUrl = getRecordingAudioUrl(recording);
  const wrongBirds = getWrongAnswers(birds, correctBird, 3);

  const options = createAnswerOptions(correctBird, wrongBirds, answerFormat, undefined, audioUrl);
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

/**
 * Helper: Generate mixed question with specified answer format
 */
function generateMixedQuestionWithFormat(birds: Bird[], answerFormat: AnswerFormat): Question | null {
  if (birds.length < 4) return null;

  // Randomly choose photo or audio for question
  const questionModalities = ['photo', 'audio'] as const;
  const questionModality = questionModalities[Math.floor(Math.random() * questionModalities.length)];

  if (questionModality === 'photo') {
    return generatePhotoQuestionWithFormat(birds, answerFormat);
  } else {
    return generateAudioQuestionWithFormat(birds, answerFormat);
  }
}
