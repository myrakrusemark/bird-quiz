import { AccuracyGraph } from './AccuracyGraph';
import { getPerformanceLevel } from '@/utils/scoring';
import type { AnswerRecord } from '@/types/bird';

interface RollingStatsCardProps {
  answers: AnswerRecord[];
  currentStreak: number;
  totalAnswers: number;
}

export function RollingStatsCard({
  answers,
  currentStreak,
  totalAnswers
}: RollingStatsCardProps) {
  // Calculate current rolling accuracy
  const rollingAccuracy = answers.length === 0
    ? 0
    : Math.round((answers.filter(a => a.correct).length / answers.length) * 100);

  const performanceLevel = getPerformanceLevel(rollingAccuracy);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Rolling Accuracy */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Rolling Accuracy</div>
          <div className="text-3xl font-bold text-blue-600">
            {rollingAccuracy}%
          </div>
          <div className={`text-xs ${performanceLevel.color} font-semibold`}>
            {performanceLevel.emoji} {performanceLevel.level}
          </div>
        </div>

        {/* Current Streak */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Current Streak</div>
          <div className="text-3xl font-bold text-orange-600">
            {currentStreak > 0 ? `🔥 ${currentStreak}` : '0'}
          </div>
          <div className="text-xs text-gray-500">
            in a row
          </div>
        </div>

        {/* Total Answered */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Answered</div>
          <div className="text-3xl font-bold text-green-600">
            {totalAnswers}
          </div>
          <div className="text-xs text-gray-500">
            all time
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Accuracy Trend (Last {answers.length}/20)
        </h3>
        <AccuracyGraph answers={answers} height={200} />
      </div>
    </div>
  );
}
