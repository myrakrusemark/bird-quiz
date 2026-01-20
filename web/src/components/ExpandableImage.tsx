interface ExpandableImageProps {
  src: string;
  alt: string;
  className: string;
  onExpand: (imageUrl: string) => void;
  iconPosition?: 'top-right' | 'bottom-right';
}

export function ExpandableImage({
  src,
  alt,
  className,
  onExpand,
  iconPosition = 'top-right',
}: ExpandableImageProps) {
  const positionClasses = iconPosition === 'top-right'
    ? 'top-2 right-2'
    : 'bottom-2 right-2';

  return (
    <div className="relative w-full h-full">
      <img src={src} alt={alt} className={className} loading="lazy" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand(src);
        }}
        className={`absolute ${positionClasses} z-10 w-10 h-10 p-1.5 hover:scale-110 transition-all cursor-pointer flex items-center justify-center`}
        aria-label="Expand image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full drop-shadow-lg"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </div>
  );
}
