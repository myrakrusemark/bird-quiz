/**
 * AudioButton Component
 *
 * A self-contained audio play/stop button with visual progress indicator.
 * The button background fills from left to right as audio plays.
 *
 * Just pass an audio URL and the component handles everything.
 */

import { useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioButtonProps {
  /** Audio URL to play */
  src: string;
  /** Optional label text (e.g., "Bird Call") */
  label?: string;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Callback when another audio should stop (for exclusive playback) */
  onPlayStart?: () => void;
  /** When true, stops playback and disables the button */
  disabled?: boolean;
}

export function AudioButton({
  src,
  label,
  size = 'md',
  className = '',
  onPlayStart,
  disabled = false,
}: AudioButtonProps) {
  const { isPlaying, progress, toggle, stop } = useAudioPlayer({
    src,
    onPlay: onPlayStart,
  });

  // Stop playback when disabled
  useEffect(() => {
    if (disabled && isPlaying) {
      stop();
    }
  }, [disabled, isPlaying, stop]);

  // Size-based styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Calculate gradient for progress fill
  const progressPercent = Math.min(progress * 100, 100);
  const backgroundStyle = isPlaying
    ? {
        background: `linear-gradient(to right, rgb(34 197 94) ${progressPercent}%, rgb(59 130 246) ${progressPercent}%)`,
      }
    : {};

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      className={`
        ${sizeStyles[size]}
        ${isPlaying ? '' : 'bg-blue-500 hover:bg-blue-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        text-white font-semibold rounded-full
        shadow-lg transition-all
        ${className}
      `}
      style={backgroundStyle}
    >
      {isPlaying ? '⏹️' : '▶️'} {isPlaying ? 'Stop' : 'Play'}{label ? ` ${label}` : ''}
    </button>
  );
}
