import { useState, useRef, useEffect } from 'react';
import type { Question, QuestionOption } from '@/types/bird';
import { ExpandableImage } from './ExpandableImage';
import { ImageModal } from './ImageModal';

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Track all option audio instances
  const optionAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [audioPlaying, setAudioPlaying] = useState<Record<string, boolean>>({});

  // Track expanded image for modal
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Cleanup all audio on component unmount or question change
  useEffect(() => {
    // Reset isPlaying state immediately when question changes
    setIsPlaying(false);

    return () => {
      // Stop main question audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Stop all option audio instances
      optionAudioRefs.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      optionAudioRefs.current.clear();
      setAudioPlaying({});
    };
  }, [question.id]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

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
            <audio
              ref={audioRef}
              src={question.secondaryMediaUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
            <button
              onClick={handlePlayAudio}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              {isPlaying ? '⏹️ Stop' : '▶️ Play Bird Call'}
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
            <audio
              ref={audioRef}
              src={question.mediaUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
            />
            <button
              onClick={handlePlayAudio}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              {isPlaying ? '⏹️ Stop' : '▶️ Play Bird Call'}
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
      let audio = optionAudioRefs.current.get(optionId);

      if (!audio) {
        audio = new Audio(audioUrl);
        optionAudioRefs.current.set(optionId, audio);

        audio.addEventListener('ended', () => {
          setAudioPlaying(prev => ({ ...prev, [optionId]: false }));
        });
      }

      if (audioPlaying[optionId]) {
        audio.pause();
        audio.currentTime = 0;
        setAudioPlaying(prev => ({ ...prev, [optionId]: false }));
      } else {
        // Stop all other option audio
        optionAudioRefs.current.forEach((aud, id) => {
          if (id !== optionId) {
            aud.pause();
            aud.currentTime = 0;
          }
        });

        setAudioPlaying({ [optionId]: true });
        audio.play();
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

      {answered && question.recording && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-700">
          <p className="font-semibold">Recording Info:</p>
          <p>Recordist: {question.recording.recordist}</p>
          <p>Location: {question.recording.location}</p>
          <p>Date: {question.recording.date}</p>
          <a
            href={question.recording.license}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            License: {question.recording.license.split('/').pop()}
          </a>
        </div>
      )}

      <ImageModal
        imageUrl={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  );
}
