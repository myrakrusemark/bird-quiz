import { useEffect } from 'react';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (imageUrl) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [imageUrl, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (imageUrl) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-6 pointer-events-none">
        <div className="relative max-w-6xl max-h-[90vh] pointer-events-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>

          {/* Image */}
          <img
            src={imageUrl}
            alt="Expanded bird image"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      </div>
    </>
  );
}
