import { useState, useRef, useEffect } from 'react';
import type { Question, QuestionOption } from '@/types/bird';

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

  // Cleanup all audio on component unmount or question change
  useEffect(() => {
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
    if (!question.mediaUrl) return null;

    switch (question.mediaType) {
      case 'photo':
        return (
          <div className="mb-6">
            <img
              src={question.mediaUrl}
              alt="Bird to identify"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg object-cover"
              style={{ maxHeight: '400px' }}
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
            {question.recording && (
              <p className="mt-2 text-sm text-gray-600">
                Recording type: {question.recording.type}
              </p>
            )}
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

    return (
      <button
        key={option.id}
        onClick={() => !answered && onAnswer(option.id)}
        disabled={answered}
        className={`w-full p-4 border-2 rounded-lg transition-all ${bgColor} ${borderColor} ${
          !answered ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        {option.type === 'text' && (
          <span className="text-lg font-medium">{option.label}</span>
        )}

        {option.type === 'text-image' && option.imageUrl && (
          <div className="flex items-center gap-3">
            <img
              src={option.imageUrl}
              alt={showLabel ? option.label : 'Bird'}
              className="w-16 h-16 object-cover rounded"
            />
            <span className="text-lg font-medium">{option.label}</span>
          </div>
        )}

        {option.type === 'image-only' && option.imageUrl && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={option.imageUrl}
              alt={showLabel ? option.label : 'Bird'}
              className="w-24 h-24 object-cover rounded"
            />
            {showLabel && <span className="text-lg font-medium">{option.label}</span>}
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

        {answered && isCorrectAnswer && (
          <span className="ml-2 text-green-600 font-bold">✓ Correct</span>
        )}
        {answered && isSelected && !isCorrect && (
          <span className="ml-2 text-red-600 font-bold">✗ Wrong</span>
        )}
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {question.questionText}
      </h2>

      {renderMedia()}

      <div className="space-y-3">
        {question.options.map(option => renderOption(option))}
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
    </div>
  );
}
