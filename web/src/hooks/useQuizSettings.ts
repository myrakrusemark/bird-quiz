import { useState } from 'react';
import type { QuizSettings, QuestionType, AnswerFormat } from '@/types/bird';

const SETTINGS_STORAGE_KEY = 'bird-quiz-settings';

// Default settings: All question types and answer formats enabled
const DEFAULT_SETTINGS: QuizSettings = {
  enabledQuestionTypes: [
    'photo-to-name',
    'audio-to-name',
    'photo-audio-to-name',
    'name-to-media',
    'mixed'
  ],
  enabledAnswerFormats: ['text', 'photo', 'audio', 'mixed']
};

/**
 * Hook for managing quiz settings with localStorage persistence
 */
export function useQuizSettings() {
  const [settings, setSettings] = useState<QuizSettings>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QuizSettings;

        // Validate that settings have at least one option enabled
        if (parsed.enabledQuestionTypes.length > 0 &&
            parsed.enabledAnswerFormats.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load quiz settings from localStorage:', error);
    }

    return DEFAULT_SETTINGS;
  });

  /**
   * Update settings and persist to localStorage
   */
  const updateSettings = (newSettings: QuizSettings) => {
    // Validate before saving
    if (newSettings.enabledQuestionTypes.length === 0 ||
        newSettings.enabledAnswerFormats.length === 0) {
      console.error('Cannot save settings with no enabled options');
      return false;
    }

    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      return true;
    } catch (error) {
      console.error('Failed to save quiz settings to localStorage:', error);
      return false;
    }
  };

  /**
   * Reset settings to defaults
   */
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Failed to reset quiz settings:', error);
    }
  };

  /**
   * Toggle a specific question type
   */
  const toggleQuestionType = (questionType: QuestionType) => {
    setSettings(prev => {
      const enabled = prev.enabledQuestionTypes.includes(questionType);

      if (enabled) {
        // Don't allow disabling the last question type
        if (prev.enabledQuestionTypes.length === 1) {
          return prev;
        }
        return {
          ...prev,
          enabledQuestionTypes: prev.enabledQuestionTypes.filter(t => t !== questionType)
        };
      } else {
        return {
          ...prev,
          enabledQuestionTypes: [...prev.enabledQuestionTypes, questionType]
        };
      }
    });
  };

  /**
   * Toggle a specific answer format
   */
  const toggleAnswerFormat = (answerFormat: AnswerFormat) => {
    setSettings(prev => {
      const enabled = prev.enabledAnswerFormats.includes(answerFormat);

      if (enabled) {
        // Don't allow disabling the last answer format
        if (prev.enabledAnswerFormats.length === 1) {
          return prev;
        }
        return {
          ...prev,
          enabledAnswerFormats: prev.enabledAnswerFormats.filter(f => f !== answerFormat)
        };
      } else {
        return {
          ...prev,
          enabledAnswerFormats: [...prev.enabledAnswerFormats, answerFormat]
        };
      }
    });
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleQuestionType,
    toggleAnswerFormat
  };
}
