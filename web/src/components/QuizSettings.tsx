import { useState, useEffect } from 'react';
import type { QuizSettings, QuestionType, AnswerFormat, RegionConfig } from '@/types/bird';

interface QuizSettingsProps {
  settings: QuizSettings;
  availableRegions: RegionConfig[];
  onSave: (settings: QuizSettings) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'photo-to-name': 'Photo → Name',
  'audio-to-name': 'Audio → Name',
  'photo-audio-to-name': 'Photo + Audio → Name',
  'name-to-media': 'Name → Media',
  'mixed': 'Mixed (Random)'
};

const ANSWER_FORMAT_LABELS: Record<AnswerFormat, string> = {
  'text': 'All Text',
  'photo': 'All Photos',
  'audio': 'All Audio',
  'mixed': 'Mixed (Random)'
};

export function QuizSettings({ settings, availableRegions, onSave, onCancel, isOpen }: QuizSettingsProps) {
  const [localSettings, setLocalSettings] = useState<QuizSettings>(settings);

  // Sync local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const toggleQuestionType = (questionType: QuestionType) => {
    const enabled = localSettings.enabledQuestionTypes.includes(questionType);

    if (enabled) {
      // Don't allow disabling the last question type
      if (localSettings.enabledQuestionTypes.length === 1) {
        return;
      }
      setLocalSettings({
        ...localSettings,
        enabledQuestionTypes: localSettings.enabledQuestionTypes.filter(t => t !== questionType)
      });
    } else {
      setLocalSettings({
        ...localSettings,
        enabledQuestionTypes: [...localSettings.enabledQuestionTypes, questionType]
      });
    }
  };

  const toggleAnswerFormat = (answerFormat: AnswerFormat) => {
    const enabled = localSettings.enabledAnswerFormats.includes(answerFormat);

    if (enabled) {
      // Don't allow disabling the last answer format
      if (localSettings.enabledAnswerFormats.length === 1) {
        return;
      }
      setLocalSettings({
        ...localSettings,
        enabledAnswerFormats: localSettings.enabledAnswerFormats.filter(f => f !== answerFormat)
      });
    } else {
      setLocalSettings({
        ...localSettings,
        enabledAnswerFormats: [...localSettings.enabledAnswerFormats, answerFormat]
      });
    }
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original
    onCancel();
  };

  // Validation
  const hasValidSettings =
    localSettings.enabledQuestionTypes.length > 0 &&
    localSettings.enabledAnswerFormats.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Quiz Settings</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Question Types Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                Question Types
              </h3>
              <div className="space-y-3">
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(questionType => {
                  const isEnabled = localSettings.enabledQuestionTypes.includes(questionType);
                  const isOnlyOne = localSettings.enabledQuestionTypes.length === 1 && isEnabled;

                  return (
                    <label
                      key={questionType}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isEnabled
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${isOnlyOne ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-gray-700 font-medium">
                        {QUESTION_TYPE_LABELS[questionType]}
                      </span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleQuestionType(questionType)}
                        disabled={isOnlyOne}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Answer Formats Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                Answer Formats
              </h3>
              <div className="space-y-3">
                {(Object.keys(ANSWER_FORMAT_LABELS) as AnswerFormat[]).map(answerFormat => {
                  const isEnabled = localSettings.enabledAnswerFormats.includes(answerFormat);
                  const isOnlyOne = localSettings.enabledAnswerFormats.length === 1 && isEnabled;

                  return (
                    <label
                      key={answerFormat}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isEnabled
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${isOnlyOne ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-gray-700 font-medium">
                        {ANSWER_FORMAT_LABELS[answerFormat]}
                      </span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleAnswerFormat(answerFormat)}
                        disabled={isOnlyOne}
                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Region Selection Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                Region
              </h3>
              <div className="space-y-2">
                {availableRegions.map(region => (
                  <label
                    key={region.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      localSettings.selectedRegion === region.id
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <span className="text-gray-700 font-medium block">
                        {region.displayName}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {region.description}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="region"
                      checked={localSettings.selectedRegion === region.id}
                      onChange={() => {
                        setLocalSettings({
                          ...localSettings,
                          selectedRegion: region.id
                        });
                      }}
                      className="w-5 h-5 text-purple-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Validation Warning */}
            {!hasValidSettings && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex items-start">
                  <span className="text-yellow-600 mr-2">⚠</span>
                  <p className="text-sm text-yellow-700">
                    At least one option must be selected in each section
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasValidSettings}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                hasValidSettings
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
