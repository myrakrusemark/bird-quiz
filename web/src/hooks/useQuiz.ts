import { useState, useCallback } from 'react';
import type { Bird, QuizState, LearningMode, QuizSettings } from '@/types/bird';
import { generateQuestion } from '@/utils/questionGenerator';

const DEFAULT_QUIZ_STATE: QuizState = {
  currentQuestion: null,
  questionNumber: 0,
  streak: 0,
  mode: 'mixed',
  answered: false,
  selectedAnswer: null,
  isCorrect: null,
};

/**
 * Hook for managing quiz state and logic
 */
export function useQuiz(settings: QuizSettings) {
  const mode: LearningMode = 'mixed';
  const [state, setState] = useState<QuizState>({
    ...DEFAULT_QUIZ_STATE,
    mode,
  });

  /**
   * Start a new quiz with given birds
   */
  const startQuiz = useCallback((birds: Bird[]) => {
    const firstQuestion = generateQuestion(birds, settings);

    setState({
      ...DEFAULT_QUIZ_STATE,
      mode: 'mixed',
      currentQuestion: firstQuestion,
      questionNumber: 1,
    });
  }, [settings]);

  /**
   * Generate next question
   */
  const nextQuestion = useCallback((birds: Bird[]) => {
    setState(prev => {
      const nextQ = generateQuestion(birds, settings);

      return {
        ...prev,
        currentQuestion: nextQ,
        questionNumber: prev.questionNumber + 1,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
      };
    });
  }, [settings]);

  /**
   * Check if answer is correct and update state
   */
  const checkAnswer = useCallback((answerId: string) => {
    setState(prev => {
      if (!prev.currentQuestion || prev.answered) {
        return prev;
      }

      const correct = answerId === prev.currentQuestion.correctAnswer;
      const newStreak = correct ? prev.streak + 1 : 0;

      return {
        ...prev,
        answered: true,
        selectedAnswer: answerId,
        isCorrect: correct,
        streak: newStreak,
      };
    });
  }, []);

  /**
   * Reset quiz to initial state
   */
  const resetQuiz = useCallback(() => {
    setState({
      ...DEFAULT_QUIZ_STATE,
      mode: 'mixed',
    });
  }, []);

  return {
    state,
    startQuiz,
    nextQuestion,
    checkAnswer,
    resetQuiz,
  };
}
