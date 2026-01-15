import type { Bird, BirdPhoto, BirdRecording } from '@/types/bird';
import { ExpandableImage } from './ExpandableImage';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { getPhotoUrl, getRecordingAudioUrl } from '@/utils/dataLoader';

interface AboutSectionProps {
  bird: Bird;
  speciesInfoMedia: {
    photo: BirdPhoto | undefined;
    recording: BirdRecording | undefined;
  } | null;
  onExpandImage: (imageUrl: string) => void;
}

export function AboutSection({ bird, speciesInfoMedia, onExpandImage }: AboutSectionProps) {
  // Audio player for species info recording
  const speciesAudioSrc = speciesInfoMedia?.recording
    ? getRecordingAudioUrl(speciesInfoMedia.recording)
    : null;
  const speciesAudio = useAudioPlayer({ src: speciesAudioSrc });

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl p-6">
      <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Indie Flower', cursive" }}>
        About the {bird.commonName}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Random Photo */}
        <div>
          {speciesInfoMedia?.photo && (
            <ExpandableImage
              src={getPhotoUrl(speciesInfoMedia.photo)}
              alt={`${bird.commonName}`}
              className="w-full rounded-lg shadow-lg object-cover"
              onExpand={() => onExpandImage(getPhotoUrl(speciesInfoMedia.photo!))}
              iconPosition="bottom-right"
            />
          )}
        </div>

        {/* Right: Audio + Description */}
        <div className="flex flex-col gap-4">
          {/* Audio Player */}
          {speciesInfoMedia?.recording && (
            <div className="text-center">
              <button
                onClick={speciesAudio.toggle}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                {speciesAudio.isPlaying ? '⏹️ Stop Call' : '▶️ Play Call'}
              </button>
            </div>
          )}

          {/* Description */}
          <div className="text-white text-sm leading-relaxed">
            <p>{bird.description}</p>
          </div>

          {/* Scientific Name with Wikipedia Link */}
          <div className="text-gray-300 text-xs italic mt-2 flex items-center justify-between">
            <em>{bird.scientificName}</em>
            <a
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(bird.commonName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 hover:underline ml-2"
            >
              Wikipedia →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
