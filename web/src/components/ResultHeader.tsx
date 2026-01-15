interface ResultHeaderProps {
  isCorrect: boolean;
  selectedBirdName: string;
  onNextQuestion: () => void;
}

export function ResultHeader({ isCorrect, selectedBirdName, onNextQuestion }: ResultHeaderProps) {
  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-8 flex items-center justify-between">
      <div
        className={`text-4xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
        style={{ fontFamily: "'Indie Flower', cursive" }}
      >
        {isCorrect ? '✓' : '✗'} {selectedBirdName}
      </div>
      <button
        onClick={onNextQuestion}
        className="border-2 border-white/50 hover:border-white hover:bg-white/10 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
