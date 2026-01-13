import { useQuizContext } from './contexts/QuizContext';
import { useToast } from './hooks/useToast';
import { QuestionCard } from './components/QuestionCard';
import { ProgressBar } from './components/ProgressBar';
import { QuizSettings } from './components/QuizSettings';
import { ToastContainer } from './components/Toast';

function App() {
  // Toast notifications
  const { toasts, removeToast } = useToast();

  // Get everything from unified quiz context
  const {
    state,
    answerQuestion,
    nextQuestion,
    updateSettings,
    toggleSettingsModal,
    rollingAccuracy,
    currentStreak,
    totalAnswers,
    isLoading,
    error,
  } = useQuizContext();

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐦❌</div>
          <p className="text-xl font-semibold text-red-600 mb-4">
            Failed to load bird data
          </p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
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
    <>
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <ProgressBar
            rollingAccuracy={rollingAccuracy}
            streak={currentStreak}
            totalAnswered={totalAnswers}
            answers={state.progress.rollingStats.answers}
            onSettingsClick={() => toggleSettingsModal(true)}
          />

          {/* Settings Modal */}
          <QuizSettings
            settings={state.settings}
            onSave={(newSettings) => {
              updateSettings(newSettings);
              toggleSettingsModal(false);
            }}
            onCancel={() => toggleSettingsModal(false)}
            isOpen={state.settingsOpen}
          />

          {state.currentQuestion && (
            <>
              <QuestionCard
                question={state.currentQuestion}
                onAnswer={answerQuestion}
                answered={state.answered}
                isCorrect={state.isCorrect}
                selectedAnswer={state.selectedAnswer}
              />

              {state.answered && (
                <div className="mt-6 text-center">
                  <button
                    onClick={nextQuestion}
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
    </>
  );
}

export default App;
