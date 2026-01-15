/**
 * AdBanner Component
 *
 * Displays Google AdSense advertisements.
 * Before AdSense approval, shows a placeholder.
 *
 * To configure:
 * 1. Replace ADSENSE_CLIENT_ID with your ca-pub-XXXXX ID
 * 2. Replace ADSENSE_SLOT_ID with your ad unit slot ID
 * 3. Add the AdSense script to index.html
 */

import { useEffect, useRef } from 'react';

// TODO: Replace with your actual AdSense IDs after approval
const ADSENSE_CLIENT_ID = 'ca-pub-XXXXXXXXXXXXXXXX';
const ADSENSE_SLOT_ID = 'XXXXXXXXXX';

// Set to true once AdSense is approved and configured
const ADSENSE_ENABLED = false;

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Push ad to AdSense when component mounts (only if enabled)
    if (ADSENSE_ENABLED && adRef.current) {
      try {
        // @ts-expect-error - adsbygoogle is added by the AdSense script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  // Show placeholder when AdSense is not yet enabled
  if (!ADSENSE_ENABLED) {
    return (
      <div
        className={`bg-gray-800/50 border border-gray-700 border-dashed rounded-lg p-4 text-center ${className}`}
      >
        <p className="text-gray-500 text-sm">
          Advertisement space
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={ADSENSE_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
