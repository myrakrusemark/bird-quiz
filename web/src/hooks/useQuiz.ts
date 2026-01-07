import { useState, useCallback } from 'react';
import type { Bird, Question, QuizState, LearningMode } from '@/types/bird';
import { generateQuestion } from '@/utils/questionGenerator';
import { calculateScore } from '@/utils/scoring';

const DEFAULT_QUIZ_STATE: QuizState = {
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 10,
  score: 0,
  streak: 0,
  mode: 'mixed',
  answered: false,
  selectedAnswer: null,
  isCorrect: null,
};

/**
 * Hook for managing quiz state and logic
 */
export function useQuiz(totalQuestions: number = 10) {
  const mode: LearningMode = 'mixed';
  const [state, setState] = useState<QuizState>({
    ...DEFAULT_QUIZ_STATE,
    mode,
    totalQuestions,
  });

  /**
   * Start a new quiz with given birds
   */
  const startQuiz = useCallback((birds: Bird[]) => {
    const firstQuestion = generateQuestion('mixed', birds);

    setState({
      ...DEFAULT_QUIZ_STATE,
      mode: 'mixed',
      totalQuestions,
      currentQuestion: firstQuestion,
      questionNumber: 1,
    });
  }, [totalQuestions]);

  /**
   * Generate next question
   */
  const nextQuestion = useCallback((birds: Bird[]) => {
    setState(prev => {
      if (prev.questionNumber >= prev.totalQuestions) {
        // Quiz complete
        return {
          ...prev,
          currentQuestion: null,
        };
      }

      const nextQ = generateQuestion(prev.mode, birds);

      return {
        ...prev,
        currentQuestion: nextQ,
        questionNumber: prev.questionNumber + 1,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
      };
    });
  }, []);

  /**
   * Check if answer is correct and update state
   */
  const checkAnswer = useCallback((answerId: string, isFirstTry: boolean = true) => {
    setState(prev => {
      if (!prev.currentQuestion || prev.answered) {
        return prev;
      }

      const correct = answerId === prev.currentQuestion.correctAnswer;
      const newStreak = correct ? prev.streak + 1 : 0;
      const earnedScore = calculateScore(correct, isFirstTry, newStreak);

      return {
        ...prev,
        answered: true,
        selectedAnswer: answerId,
        isCorrect: correct,
        score: prev.score + earnedScore,
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
      totalQuestions,
    });
  }, [totalQuestions]);

  /**
   * Check if quiz is complete
   */
  const isQuizComplete = state.questionNumber >= state.totalQuestions && state.answered;

  return {
    state,
    startQuiz,
    nextQuestion,
    checkAnswer,
    resetQuiz,
    isQuizComplete,
  };
}
