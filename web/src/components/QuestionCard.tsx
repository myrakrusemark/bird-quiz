import { useState, useRef, useEffect, useMemo } from 'react';
import type { Question, QuestionOption, BirdPhoto, BirdRecording } from '@/types/bird';
import { ExpandableImage } from './ExpandableImage';
import { ImageModal } from './ImageModal';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { selectRandomMedia, type UsedMedia } from '@/utils/randomMediaSelector';

// Extend HTMLAudioElement to store event handler reference
interface AudioWithHandler extends HTMLAudioElement {
  __endedHandler?: () => void;
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (answerId: string) => void;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
}

export function QuestionCard({
  question,
  onAnswer,
  answered,
  isCorrect,
  selectedAnswer,
}: QuestionCardProps) {
  // Determine which audio URL to use for main question audio
  const mainAudioUrl = useMemo(() => {
    if (question.mediaType === 'audio') {
      return question.mediaUrl;
    } else if (question.secondaryMediaUrl) {
      return question.secondaryMediaUrl;
    }
    return null;
  }, [question.mediaType, question.mediaUrl, question.secondaryMediaUrl]);

  // Use the new useAudioPlayer hook for main question audio
  const mainAudio = useAudioPlayer({ src: mainAudioUrl || null });

  // Track all option audio instances (map of audioUrl -> audio player)
  const optionAudios = useRef<Map<string, AudioWithHandler>>(new Map());
  const [audioPlaying, setAudioPlaying] = useState<Record<string, boolean>>({});

  // Track expanded image for modal
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Species info media selection
  const [speciesInfoMedia, setSpeciesInfoMedia] = useState<{
    photo: BirdPhoto | undefined;
    recording: BirdRecording | undefined;
  } | null>(null);

  // Audio player for species info recording
  const speciesAudioSrc = speciesInfoMedia?.recording?.cachedAudio || null;
  const speciesAudio = useAudioPlayer({ src: speciesAudioSrc });

  // Cleanup option audio instances when question changes
  useEffect(() => {
    // Capture current ref value at effect creation time
    const audiosToCleanup = optionAudios.current;

    return () => {
      // Stop and clean up all option audio instances
      audiosToCleanup.forEach((audio) => {
        // Remove event listener if it exists
        if (audio.__endedHandler) {
          audio.removeEventListener('ended', audio.__endedHandler);
          delete audio.__endedHandler;
        }

        // Stop playback and clear source
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      });
      audiosToCleanup.clear();
      setAudioPlaying({});
    };
  }, [question.id]);

  // Select random species info media when question is answered
  useEffect(() => {
    if (!answered || !question.bird) {
      setSpeciesInfoMedia(null);
      return;
    }

    // Track all media used in question
    const usedMedia: UsedMedia = {
      photoUrl: question.mediaType === 'photo' ? question.mediaUrl : undefined,
      audioUrl: question.mediaType === 'audio' ? question.mediaUrl : undefined,
    };

    // Check secondary media (for combined photo+audio questions)
    if (question.secondaryMediaUrl) {
      if (question.secondaryMediaType === 'photo') {
        usedMedia.photoUrl = question.secondaryMediaUrl;
      } else if (question.secondaryMediaType === 'audio') {
        usedMedia.audioUrl = question.secondaryMediaUrl;
      }
    }

    // Check options for used media (name-to-media questions)
    question.options.forEach(option => {
      if (option.imageUrl) usedMedia.photoUrl = option.imageUrl;
      if (option.audioUrl) usedMedia.audioUrl = option.audioUrl;
    });

    // Select random media excluding used media
    const selected = selectRandomMedia(question.bird, usedMedia);
    setSpeciesInfoMedia(selected);
  }, [answered, question.id]);

  const renderMedia = () => {
    // Handle photo + audio combined
    if (question.mediaUrl && question.secondaryMediaUrl) {
      return (
        <div className="mb-6 flex flex-col items-center gap-4">
          {/* Photo */}
          <ExpandableImage
            src={question.mediaUrl}
            alt="Bird to identify"
            className="w-full max-w-md mx-auto rounded-lg shadow-lg object-cover"
            onExpand={() => setExpandedImage(question.mediaUrl || null)}
            iconPosition="bottom-right"
          />

          {/* Audio player */}
          <div className="w-full max-w-md text-center">
            <button
              onClick={mainAudio.toggle}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              {mainAudio.isPlaying ? '⏹️ Stop' : '▶️ Play Bird Call'}
            </button>
          </div>
        </div>
      );
    }

    if (!question.mediaUrl) return null;

    switch (question.mediaType) {
      case 'photo':
        return (
          <div className="mb-6">
            <ExpandableImage
              src={question.mediaUrl}
              alt="Bird to identify"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg object-cover"
              onExpand={() => setExpandedImage(question.mediaUrl || null)}
              iconPosition="bottom-right"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="mb-6 text-center">
            <button
              onClick={mainAudio.toggle}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              {mainAudio.isPlaying ? '⏹️ Stop' : '▶️ Play Bird Call'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderOption = (option: QuestionOption) => {
    const isSelected = selectedAnswer === option.id;
    const isCorrectAnswer = option.id === question.correctAnswer;
    const showLabel = !option.hideLabel || answered;
    const isImageOnly = option.type === 'image-only';

    let bgColor = 'bg-white hover:bg-gray-50';
    let borderColor = 'border-gray-300';

    if (answered) {
      if (isCorrectAnswer) {
        bgColor = 'bg-green-100 border-green-500';
        borderColor = 'border-green-500';
      } else if (isSelected && !isCorrect) {
        bgColor = 'bg-red-100 border-red-500';
        borderColor = 'border-red-500';
      }
    } else if (isSelected) {
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-400';
    }

    const handleOptionAudioPlay = (optionId: string, audioUrl: string) => {
      let audio = optionAudios.current.get(optionId);

      if (!audio) {
        audio = new Audio(audioUrl) as AudioWithHandler;
        optionAudios.current.set(optionId, audio);

        // Create event handler and store it so we can remove it later
        const endedHandler = () => {
          setAudioPlaying(prev => ({ ...prev, [optionId]: false }));
        };

        // Store the handler on the audio element for later removal
        audio.__endedHandler = endedHandler;
        audio.addEventListener('ended', endedHandler);
      }

      if (audioPlaying[optionId]) {
        audio.pause();
        audio.currentTime = 0;
        setAudioPlaying(prev => ({ ...prev, [optionId]: false }));
      } else {
        // Stop all other option audio
        optionAudios.current.forEach((aud, id) => {
          if (id !== optionId) {
            aud.pause();
            aud.currentTime = 0;
          }
        });

        setAudioPlaying({ [optionId]: true });
        audio.play().catch((error) => {
          console.error('Error playing option audio:', error);
          setAudioPlaying(prev => ({ ...prev, [optionId]: false }));
        });
      }
    };

    // Shared content for all option types
    const optionContent = (
      <>
        {option.type === 'text' && (
          <span className="text-lg font-medium">{option.label}</span>
        )}

        {option.type === 'text-image' && option.imageUrl && (
          <div className="flex items-center gap-3">
            <ExpandableImage
              src={option.imageUrl!}
              alt={option.label || 'Bird'}
              className="w-16 h-16 object-cover rounded"
              onExpand={() => setExpandedImage(option.imageUrl!)}
              iconPosition="bottom-right"
            />
            <span className="text-lg font-medium">{option.label}</span>
          </div>
        )}

        {option.type === 'image-only' && option.imageUrl && (
          <div className="relative w-full">
            <ExpandableImage
              src={option.imageUrl!}
              alt={option.label || 'Bird'}
              className="w-full h-full object-cover rounded-lg"
              onExpand={() => setExpandedImage(option.imageUrl!)}
              iconPosition="bottom-right"
            />
            {showLabel && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center rounded-b-lg">
                <span className="text-lg font-medium">{option.label}</span>
              </div>
            )}
          </div>
        )}

        {option.type === 'audio-only' && option.audioUrl && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOptionAudioPlay(option.id, option.audioUrl!);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600"
            >
              {audioPlaying[option.id] ? '⏹️ Stop' : '▶️ Play'}
            </button>
            {showLabel && <span className="text-lg font-medium mt-1">{option.label}</span>}
          </div>
        )}

        {answered && isCorrectAnswer && !isImageOnly && (
          <span className="ml-2 text-green-600 font-bold">✓ Correct</span>
        )}
        {answered && isSelected && !isCorrect && !isImageOnly && (
          <span className="ml-2 text-red-600 font-bold">✗ Wrong</span>
        )}
      </>
    );

    // Use conditional wrapper to allow audio buttons to work after answering
    const containerPadding = isImageOnly ? 'p-0 overflow-hidden' : 'p-4';

    if (answered) {
      return (
        <div
          key={option.id}
          className={`w-full ${containerPadding} border-2 rounded-lg transition-all cursor-default ${bgColor} ${borderColor}`}
        >
          {optionContent}
        </div>
      );
    }

    return (
      <div
        key={option.id}
        onClick={() => onAnswer(option.id)}
        className={`w-full ${containerPadding} border-2 rounded-lg transition-all cursor-pointer ${bgColor} ${borderColor}`}
      >
        {optionContent}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Question box */}
        <div className="flex justify-center lg:flex-1">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-white">
              {question.questionText}
            </h2>

            {/* Display bird name for reverse mode (name-to-media) */}
            {question.questionType === 'name-to-media' && (
              <div className="mb-6 text-center">
                <span className="text-3xl font-bold text-blue-300">
                  {question.bird.commonName}
                </span>
              </div>
            )}

            {renderMedia()}
          </div>
        </div>

        {/* Answer grid */}
        <div className="w-full lg:w-96 flex gap-3">
          {/* Left column */}
          <div className="flex flex-col gap-3 flex-1">
            {question.options.slice(0, 2).map(option => renderOption(option))}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3 flex-1">
            {question.options.slice(2, 4).map(option => renderOption(option))}
          </div>
        </div>
      </div>

      {answered && (
        <div className="mt-6 bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4">
            About the {question.bird.commonName}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Random Photo */}
            <div>
              {speciesInfoMedia?.photo && (
                <ExpandableImage
                  src={speciesInfoMedia.photo.cached}
                  alt={`${question.bird.commonName}`}
                  className="w-full rounded-lg shadow-lg object-cover"
                  onExpand={() => setExpandedImage(speciesInfoMedia.photo!.cached)}
                  iconPosition="bottom-right"
                />
              )}
            </div>

            {/* Right: Audio + Description */}
            <div className="flex flex-col gap-4">
              {/* Audio Player */}
              {speciesInfoMedia?.recording && (
                <div className="text-center">
                  <button
                    onClick={speciesAudio.toggle}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                  >
                    {speciesAudio.isPlaying ? '⏹️ Stop Call' : '▶️ Play Call'}
                  </button>
                </div>
              )}

              {/* Description */}
              <div className="text-white text-sm leading-relaxed">
                <p>{question.bird.description}</p>
              </div>

              {/* Scientific Name with Wikipedia Link */}
              <div className="text-gray-300 text-xs italic mt-2 flex items-center justify-between">
                <em>{question.bird.scientificName}</em>
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(question.bird.commonName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 hover:underline ml-2"
                >
                  Wikipedia →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImageModal
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  );
}
