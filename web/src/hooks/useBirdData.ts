import { useState, useEffect } from 'react';
import type { Bird } from '@/types/bird';
import { getAllBirds, getRandomBirds } from '@/utils/dataLoader';

/**
 * Hook for loading and managing bird data
 */
export function useBirdData(count?: number) {
  const [birds, setBirds] = useState<Bird[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadBirds();
  }, [count]);

  const loadBirds = async () => {
    try {
      setLoading(true);
      setError(null);

      const loadedBirds = count
        ? await getRandomBirds(count)
        : await getAllBirds();

      setBirds(loadedBirds);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading birds:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadBirds();
  };

  return {
    birds,
    loading,
    error,
    refresh,
  };
}
