import { AccuracyGraph } from './AccuracyGraph';
import type { AnswerRecord } from '@/types/bird';

interface ProgressBarProps {
  rollingAccuracy: number;
  streak: number;
  totalAnswered: number;
  answers: AnswerRecord[];
  onSettingsClick?: () => void;
}

export function ProgressBar({
  rollingAccuracy,
  streak,
  totalAnswered,
  answers,
  onSettingsClick
}: ProgressBarProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-6 items-center flex-1">
          <div>
            <span className="text-sm text-gray-600">Answered</span>
            <p className="text-xl font-bold">{totalAnswered}</p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-sm text-gray-600">Rolling Accuracy</span>
              <p className="text-xl font-bold text-blue-600">{rollingAccuracy}%</p>
            </div>
            {/* Sparkline chart */}
            {answers.length >= 2 && (
              <div className="w-32 h-12">
                <AccuracyGraph answers={answers} height={48} compact={true} />
              </div>
            )}
          </div>
          <div>
            <span className="text-sm text-gray-600">Streak</span>
            <p className="text-xl font-bold text-orange-600">
              {streak > 0 ? `🔥 ${streak}` : '0'}
            </p>
          </div>
        </div>

        {/* Settings button */}
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
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
        )}
      </div>
    </div>
  );
}
