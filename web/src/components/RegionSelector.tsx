import { useEffect } from 'react';
import type { RegionConfig } from '@/types/bird';

interface RegionSelectorProps {
  currentRegion: RegionConfig | null;
  availableRegions: RegionConfig[];
  onSelectRegion: (regionId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function RegionSelector({
  currentRegion,
  availableRegions,
  onSelectRegion,
  onClose,
  isOpen
}: RegionSelectorProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRegionClick = (regionId: string) => {
    onSelectRegion(regionId);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Select Region</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-3">
              {availableRegions.map(region => {
                const isSelected = currentRegion?.id === region.id;

                return (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-gray-800 font-semibold block text-lg" style={{ fontFamily: "'Indie Flower', cursive" }}>
                        {region.displayName}
                      </span>
                      <span className="text-gray-600 text-sm mt-1 block">
                        {region.description}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="text-purple-600 text-2xl ml-3">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Helper text */}
            <p className="text-sm text-gray-500 mt-4 text-center">
              Click a region to switch immediately
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
