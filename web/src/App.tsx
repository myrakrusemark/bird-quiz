import { useState } from 'react';
import { useBirdData } from './hooks/useBirdData';
import { useQuiz } from './hooks/useQuiz';
import { useQuizSettings } from './hooks/useQuizSettings';
import { useProgress } from './hooks/useProgress';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { QuizSettings } from './components/QuizSettings';

function App() {
  // Quiz settings
  const { settings, updateSettings } = useQuizSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load random subset of birds for the quiz
  const { birds, loading: birdsLoading } = useBirdData(20);

  // Progress tracking
  const { progress, recordAnswer, getRollingAccuracy } = useProgress();

  // Quiz state
  const {
    state: quizState,
    startQuiz,
    nextQuestion,
    checkAnswer,
  } = useQuiz(settings);

  const handleAnswer = (answerId: string) => {
    checkAnswer(answerId);

    // Record progress
    if (quizState.currentQuestion) {
      const isCorrect = answerId === quizState.currentQuestion.correctAnswer;
      recordAnswer(
        quizState.currentQuestion.bird.id,
        quizState.mode,
        isCorrect,
        quizState.currentQuestion.questionType,
        quizState.currentQuestion.answerFormat
      );
    }
  };

  const handleNext = () => {
    nextQuestion(birds);
  };

  // Start quiz when birds finish loading
  if (!quizState.currentQuestion && birds.length > 0) {
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

  // Quiz in progress
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <ProgressBar
          rollingAccuracy={getRollingAccuracy()}
          streak={progress.rollingStats.currentStreak}
          totalAnswered={progress.rollingStats.totalAnswers}
          answers={progress.rollingStats.answers}
          onSettingsClick={() => setSettingsOpen(true)}
        />

        {/* Settings Modal */}
        <QuizSettings
          settings={settings}
          onSave={(newSettings) => {
            updateSettings(newSettings);
            setSettingsOpen(false);
          }}
          onCancel={() => setSettingsOpen(false)}
          isOpen={settingsOpen}
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
                  Next Question →
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
