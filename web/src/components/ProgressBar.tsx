import { useState } from 'react';
import { AccuracyGraph } from './AccuracyGraph';
import type { AnswerRecord, RegionConfig } from '@/types/bird';

interface ProgressBarProps {
  rollingAccuracy: number;
  streak: number;
  totalAnswered: number;
  answers: AnswerRecord[];
  currentRegion: RegionConfig | null;
  onSettingsClick?: () => void;
  onRegionClick?: () => void;
}

export function ProgressBar({
  rollingAccuracy,
  streak,
  totalAnswered: _totalAnswered,
  answers,
  currentRegion,
  onSettingsClick,
  onRegionClick
}: ProgressBarProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex justify-center mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="inline-flex flex-col bg-black/60 backdrop-blur-sm shadow-xl rounded-none md:rounded-lg border border-x-0 md:border-x border-white/20 px-4 py-2">
        <div className="flex items-stretch gap-4">
          {/* Region selector button */}
          {currentRegion && onRegionClick && (
            <>
              <div className="flex flex-col items-center">
                <button
                  onClick={onRegionClick}
                  className="flex items-center gap-2 text-white hover:text-white/90 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
                  aria-label="Change region"
                >
                  <span className="text-2xl font-bold tracking-wide" style={{ fontFamily: "'Indie Flower', cursive" }}>
                    {currentRegion.displayName}
                  </span>
                </button>
                <span className={`text-xs text-white/60 overflow-hidden transition-all duration-200 ${isHovered ? 'max-h-4 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  Click to change region
                </span>
              </div>
              <div className="h-8 w-px bg-white/20" />
            </>
          )}

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 flex-1">
              <p className="text-xl font-bold text-green-300">{rollingAccuracy}%</p>
              {/* Sparkline chart */}
              {answers.length >= 2 && (
                <div className="w-16 h-6">
                  <AccuracyGraph answers={answers} height={24} compact={true} />
                </div>
              )}
            </div>
            <span className={`text-xs text-white/60 overflow-hidden transition-all duration-200 ${isHovered ? 'max-h-4 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              Accuracy
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 flex-1">
              <span className="text-xl">🔥</span>
              <p className="text-xl font-bold text-yellow-300">{streak}</p>
            </div>
            <span className={`text-xs text-white/60 overflow-hidden transition-all duration-200 ${isHovered ? 'max-h-4 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
              Streak
            </span>
          </div>

          {/* Settings button */}
          {onSettingsClick && (
            <div className="flex flex-col items-center">
              <button
                onClick={onSettingsClick}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-1"
                aria-label="Quiz Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <span className={`text-xs text-white/60 overflow-hidden transition-all duration-200 ${isHovered ? 'max-h-4 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                Settings
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
