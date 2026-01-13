/**
 * useAudioPlayer Hook
 *
 * Manages audio playback with proper cleanup of event listeners and state.
 * Prevents memory leaks by ensuring all audio instances and event listeners
 * are properly disposed when the component unmounts or when audio changes.
 */

import { useRef, useEffect, useState, useCallback } from 'react';

interface UseAudioPlayerOptions {
  /**
   * Audio URL to play. When this changes, the previous audio is stopped and cleaned up.
   */
  src: string | null;

  /**
   * Whether to automatically play when src changes (default: false)
   */
  autoPlay?: boolean;

  /**
   * Callback when audio playback ends
   */
  onEnded?: () => void;

  /**
   * Callback when playback is paused
   */
  onPause?: () => void;

  /**
   * Callback when playback starts
   */
  onPlay?: () => void;
}

interface UseAudioPlayerReturn {
  /**
   * Whether audio is currently playing
   */
  isPlaying: boolean;

  /**
   * Play the audio
   */
  play: () => void;

  /**
   * Pause the audio
   */
  pause: () => void;

  /**
   * Stop the audio (pause and reset to beginning)
   */
  stop: () => void;

  /**
   * Toggle between play and pause
   */
  toggle: () => void;

  /**
   * Reference to the HTMLAudioElement (use with caution)
   */
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function useAudioPlayer(options: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const { src, autoPlay = false, onEnded, onPause, onPlay } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Store event listeners in refs so we can remove them later
  const endedHandlerRef = useRef<(() => void) | null>(null);
  const pauseHandlerRef = useRef<(() => void) | null>(null);
  const playHandlerRef = useRef<(() => void) | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!src) {
      // Clean up if src is null
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Create new audio element
    const audio = new Audio(src);
    audioRef.current = audio;

    // Create event handlers
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    // Store handlers in refs
    endedHandlerRef.current = handleEnded;
    pauseHandlerRef.current = handlePause;
    playHandlerRef.current = handlePlay;

    // Add event listeners
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    // Auto-play if requested
    if (autoPlay) {
      audio.play().catch((error) => {
        console.warn('Auto-play prevented by browser:', error);
      });
    }

    // Cleanup function
    return () => {
      // Remove event listeners
      if (audio) {
        if (endedHandlerRef.current) {
          audio.removeEventListener('ended', endedHandlerRef.current);
        }
        if (pauseHandlerRef.current) {
          audio.removeEventListener('pause', pauseHandlerRef.current);
        }
        if (playHandlerRef.current) {
          audio.removeEventListener('play', playHandlerRef.current);
        }

        // Stop playback
        audio.pause();
        audio.currentTime = 0;

        // Clear source to release memory
        audio.src = '';
      }

      // Clear refs
      audioRef.current = null;
      endedHandlerRef.current = null;
      pauseHandlerRef.current = null;
      playHandlerRef.current = null;
      setIsPlaying(false);
    };
  }, [src, autoPlay, onEnded, onPause, onPlay]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  return {
    isPlaying,
    play,
    pause,
    stop,
    toggle,
    audioRef,
  };
}
