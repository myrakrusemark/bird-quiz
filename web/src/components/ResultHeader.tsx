interface ResultHeaderProps {
  isCorrect: boolean;
  selectedBirdName: string;
  onNextQuestion: () => void;
}

export function ResultHeader({ isCorrect, selectedBirdName, onNextQuestion }: ResultHeaderProps) {
  return (
    <div className={`${isCorrect ? 'bg-green-300' : 'bg-amber-400'} rounded-none md:rounded-t-lg shadow-xl p-4 flex items-center justify-between`}>
      <div
        className={`text-2xl font-bold ${isCorrect ? 'text-green-800' : 'text-red-700'}`}
        style={{ fontFamily: "'Indie Flower', cursive" }}
      >
        {isCorrect ? '✓' : '✗'} {selectedBirdName}
      </div>
      <button
        onClick={onNextQuestion}
        className={`border-2 ${isCorrect ? 'border-green-700 hover:border-green-900 hover:bg-green-400 text-green-900' : 'border-amber-700 hover:border-amber-900 hover:bg-amber-500 text-amber-900'} px-6 py-3 rounded-lg text-lg font-semibold transition-colors`}
      >
        Next →
      </button>
    </div>
  );
}
