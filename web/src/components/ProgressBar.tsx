interface ProgressBarProps {
  current: number;
  total: number;
  score: number;
  streak: number;
}

export function ProgressBar({ current, total, score, streak }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-6">
          <div>
            <span className="text-sm text-gray-600">Question</span>
            <p className="text-xl font-bold">{current} / {total}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Score</span>
            <p className="text-xl font-bold text-blue-600">{score}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Streak</span>
            <p className="text-xl font-bold text-orange-600">
              {streak > 0 ? `🔥 ${streak}` : '0'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
