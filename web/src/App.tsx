import { useBirdData } from './hooks/useBirdData';
import { useQuiz } from './hooks/useQuiz';
import { useProgress } from './hooks/useProgress';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';

function App() {
  // Load random subset of birds for the quiz
  const { birds, loading: birdsLoading } = useBirdData(10);

  // Progress tracking
  const { progress, recordAnswer } = useProgress();

  // Quiz state
  const {
    state: quizState,
    startQuiz,
    nextQuestion,
    checkAnswer,
    resetQuiz,
    isQuizComplete,
  } = useQuiz(10);

  const handleAnswer = (answerId: string) => {
    checkAnswer(answerId);

    // Record progress
    if (quizState.currentQuestion) {
      const isCorrect = answerId === quizState.currentQuestion.correctAnswer;
      recordAnswer(
        quizState.currentQuestion.bird.id,
        quizState.mode,
        isCorrect
      );
    }
  };

  const handleNext = () => {
    nextQuestion(birds);
  };

  const handleBackToMenu = () => {
    resetQuiz();
  };

  // Start quiz when birds finish loading
  if (!quizState.currentQuestion && birds.length > 0 && !isQuizComplete) {
    startQuiz(birds);
  }

  // Loading state
  if (birdsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐦</div>
          <p className="text-xl font-semibold text-gray-700">Loading birds...</p>
        </div>
      </div>
    );
  }

  // Quiz complete screen
  if (isQuizComplete) {
    const accuracy = Math.round((quizState.score / (quizState.totalQuestions * 15)) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-6">
            {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '📚'}
          </div>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Quiz Complete!
          </h2>

          <div className="space-y-4 mb-8">
            <div className="text-6xl font-bold text-blue-600">
              {quizState.score}
            </div>
            <p className="text-xl text-gray-600">Total Score</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {progress.modeStats.correct}
                </div>
                <p className="text-sm text-gray-600">Correct</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-gray-700">
                  {progress.modeStats.total}
                </div>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <div className="text-2xl font-bold text-blue-600">
                {progress.modeStats.accuracy || 0}%
              </div>
              <p className="text-sm text-gray-600">Overall Accuracy</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                resetQuiz();
                startQuiz(birds);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressBar
          current={quizState.questionNumber}
          total={quizState.totalQuestions}
          score={quizState.score}
          streak={quizState.streak}
        />

        {quizState.currentQuestion && (
          <>
            <QuestionCard
              question={quizState.currentQuestion}
              onAnswer={handleAnswer}
              answered={quizState.answered}
              isCorrect={quizState.isCorrect}
              selectedAnswer={quizState.selectedAnswer}
            />

            {quizState.answered && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleNext}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                >
                  {quizState.questionNumber < quizState.totalQuestions
                    ? 'Next Question →'
                    : 'Finish Quiz'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
