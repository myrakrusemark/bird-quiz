/**
 * Welcome Modal Component
 *
 * Shows game instructions on first visit.
 * Stores dismissal in localStorage to not show again.
 * Can be triggered manually via footer link.
 */

import { useState, useEffect } from 'react';

const WELCOME_KEY = 'bird-quiz-welcome-seen';

interface WelcomeModalProps {
  /** Force modal open (for "How to Play" link) */
  forceOpen?: boolean;
  /** Callback when modal closes */
  onClose?: () => void;
}

export function WelcomeModal({ forceOpen = false, onClose }: WelcomeModalProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setShowModal(true);
      return;
    }

    // Check if user has already seen welcome
    const seen = localStorage.getItem(WELCOME_KEY);
    if (seen === null) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setShowModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleGotIt = () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    setShowModal(false);
    onClose?.();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/20 rounded-lg shadow-2xl max-w-md w-full p-6">
        <h2
          className="text-3xl font-bold text-white mb-4 text-center"
          style={{ fontFamily: "'Indie Flower', cursive" }}
        >
          Welcome to Bird Quiz!
        </h2>

        <p className="text-gray-300 mb-4 text-center">
          Test your bird identification skills with photos and sounds from real observations.
        </p>

        <div className="text-gray-400 text-sm space-y-2 mb-6">
          <p className="flex items-start gap-2">
            <span className="text-green-400">▶</span>
            <span>Look at photos or listen to bird calls</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-400">▶</span>
            <span>Choose the correct bird from 4 options</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-400">▶</span>
            <span>Track your accuracy and streak in the header</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-400">▶</span>
            <span>Click the region name to change locations</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-400">▶</span>
            <span>Use Settings (⚙️) to customize question types</span>
          </p>
        </div>

        <button
          onClick={handleGotIt}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
