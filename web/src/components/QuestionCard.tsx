import { useState, useRef, useEffect, useMemo } from 'react';
import type { Question, QuestionOption, BirdPhoto, BirdRecording } from '@/types/bird';
import { ExpandableImage } from './ExpandableImage';
import { ImageModal } from './ImageModal';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { selectRandomMedia, type UsedMedia } from '@/utils/randomMediaSelector';
import { AboutSection } from './AboutSection';
import { ResultHeader } from './ResultHeader';

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
  onNextQuestion: () => void;
}

export function QuestionCard({
  question,
  onAnswer,
  answered,
  isCorrect,
  selectedAnswer,
  onNextQuestion,
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

  // View mode state for fade transitions
  const [viewMode, setViewMode] = useState<'question' | 'result'>('question');
  const [questionVisible, setQuestionVisible] = useState(true);
  const [resultVisible, setResultVisible] = useState(false);

  // Species info media selection
  const [speciesInfoMedia, setSpeciesInfoMedia] = useState<{
    photo: BirdPhoto | undefined;
    recording: BirdRecording | undefined;
  } | null>(null);

  // Note: speciesInfoMedia.recording is available for future audio playback feature

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

  // Handle transition when answer is submitted
  useEffect(() => {
    if (answered) {
      // Stop all audio playback
      mainAudio.pause();
      optionAudios.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });

      // Fade out question view
      setQuestionVisible(false);

      // After fade completes, switch to result view and fade it in
      const switchTimer = setTimeout(() => {
        setViewMode('result');
        setResultVisible(true);
      }, 300);

      return () => clearTimeout(switchTimer);
    }
  }, [answered, mainAudio]);

  // Reset view mode when new question loads
  useEffect(() => {
    setViewMode('question');
    setQuestionVisible(true);
    setResultVisible(false);
  }, [question.id]);

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

  const renderOption = (option: QuestionOption, index: number) => {
    const isSelected = selectedAnswer === option.id;
    const showLabel = !option.hideLabel || answered;
    const isImageOnly = option.type === 'image-only';

    let bgColor = 'bg-white/10 hover:bg-white/20';
    let textColor = 'text-white';

    // Only show selection state before answering
    if (!answered && isSelected) {
      bgColor = 'bg-blue-500/30 hover:bg-blue-500/40';
    }

    // Grid position-based borders (top-left=0, top-right=1, bottom-left=2, bottom-right=3)
    const borderClasses = [
      'border-r border-b border-white/20', // top-left
      'border-b border-white/20',           // top-right
      'border-r border-white/20',           // bottom-left
      '',                                    // bottom-right
    ][index];

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
          <span className={`text-lg font-medium ${textColor}`}>{option.label}</span>
        )}

        {option.type === 'text-image' && option.imageUrl && (
          <div className="relative w-full">
            <ExpandableImage
              src={option.imageUrl!}
              alt={option.label || 'Bird'}
              className="w-full h-full object-cover"
              onExpand={() => setExpandedImage(option.imageUrl!)}
              iconPosition="bottom-right"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center">
              <span className="text-lg font-medium">{option.label}</span>
            </div>
          </div>
        )}

        {option.type === 'image-only' && option.imageUrl && (
          <div className="relative w-full">
            <ExpandableImage
              src={option.imageUrl!}
              alt={option.label || 'Bird'}
              className="w-full h-full object-cover"
              onExpand={() => setExpandedImage(option.imageUrl!)}
              iconPosition="bottom-right"
            />
            {showLabel && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center">
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
            {answered && <span className={`text-lg font-medium mt-1 ${textColor}`}>{option.label}</span>}
          </div>
        )}
      </>
    );

    // Use conditional wrapper to allow audio buttons to work after answering
    const isFullBleedImage = isImageOnly || option.type === 'text-image';
    const containerPadding = isFullBleedImage ? 'p-0 overflow-hidden' : 'p-4';
    // Center content except for full-bleed image types
    const centerClasses = isFullBleedImage ? '' : 'flex items-center justify-center';

    if (answered) {
      return (
        <div
          key={option.id}
          className={`w-full ${containerPadding} ${borderClasses} ${centerClasses} transition-all cursor-default ${bgColor}`}
        >
          {optionContent}
        </div>
      );
    }

    return (
      <div
        key={option.id}
        onClick={() => onAnswer(option.id)}
        className={`w-full ${containerPadding} ${borderClasses} ${centerClasses} transition-all cursor-pointer ${bgColor}`}
      >
        {optionContent}
      </div>
    );
  };

  // Find selected bird name for result header
  const selectedOption = question.options.find(opt => opt.id === selectedAnswer);
  const selectedBirdName = selectedOption?.label || '';

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      {/* Question view - unified container */}
      <div
        className={`bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl overflow-hidden transition-opacity duration-300 ${
          questionVisible ? 'opacity-100' : 'opacity-0'
        } ${viewMode === 'result' ? 'absolute invisible pointer-events-none' : ''}`}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Question section */}
          <div className="lg:flex-1 p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-white">
              {question.questionText}
            </h2>

            {/* Display bird name for reverse mode (name-to-media) */}
            {question.questionType === 'name-to-media' && (
              <div className="mb-6 text-center">
                <span className="text-3xl font-bold text-blue-300" style={{ fontFamily: "'Indie Flower', cursive" }}>
                  {question.bird.commonName}
                </span>
              </div>
            )}

            {renderMedia()}
          </div>

          {/* Answer grid */}
          <div className="lg:w-96 border-t lg:border-t-0 lg:border-l border-white/20 grid grid-cols-2">
            {question.options.map((option, index) => renderOption(option, index))}
          </div>
        </div>
      </div>

      {/* Result view */}
      {answered && (
        <div
          className={`space-y-6 transition-opacity duration-300 ${
            resultVisible ? 'opacity-100' : 'opacity-0'
          } ${viewMode === 'question' ? 'absolute invisible pointer-events-none' : ''}`}
        >
          <ResultHeader
            isCorrect={isCorrect || false}
            selectedBirdName={selectedBirdName}
            onNextQuestion={onNextQuestion}
          />
          <AboutSection
            bird={question.bird}
            speciesInfoMedia={speciesInfoMedia}
            onExpandImage={(url) => setExpandedImage(url)}
          />
        </div>
      )}

      <ImageModal
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  );
}
