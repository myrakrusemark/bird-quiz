import type { QuizSettings, QuestionType, AnswerFormat } from '@/types/bird';

interface QuizSettingsProps {
  settings: QuizSettings;
  onChange: (settings: QuizSettings) => void;
  onClose: () => void;
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

export function QuizSettings({ settings, onChange, onClose, isOpen }: QuizSettingsProps) {
  const toggleQuestionType = (questionType: QuestionType) => {
    const enabled = settings.enabledQuestionTypes.includes(questionType);

    if (enabled) {
      // Don't allow disabling the last question type
      if (settings.enabledQuestionTypes.length === 1) {
        return;
      }
      onChange({
        ...settings,
        enabledQuestionTypes: settings.enabledQuestionTypes.filter(t => t !== questionType)
      });
    } else {
      onChange({
        ...settings,
        enabledQuestionTypes: [...settings.enabledQuestionTypes, questionType]
      });
    }
  };

  const toggleAnswerFormat = (answerFormat: AnswerFormat) => {
    const enabled = settings.enabledAnswerFormats.includes(answerFormat);

    if (enabled) {
      // Don't allow disabling the last answer format
      if (settings.enabledAnswerFormats.length === 1) {
        return;
      }
      onChange({
        ...settings,
        enabledAnswerFormats: settings.enabledAnswerFormats.filter(f => f !== answerFormat)
      });
    } else {
      onChange({
        ...settings,
        enabledAnswerFormats: [...settings.enabledAnswerFormats, answerFormat]
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Quiz Settings</h2>
            <button
              onClick={onClose}
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
                  const isEnabled = settings.enabledQuestionTypes.includes(questionType);
                  const isOnlyOne = settings.enabledQuestionTypes.length === 1 && isEnabled;

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
                  const isEnabled = settings.enabledAnswerFormats.includes(answerFormat);
                  const isOnlyOne = settings.enabledAnswerFormats.length === 1 && isEnabled;

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

          </div>
        </div>
      </div>
    </>
  );
}
