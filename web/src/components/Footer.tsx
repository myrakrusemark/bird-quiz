/**
 * Footer Component
 *
 * Site footer with navigation links to Privacy Policy,
 * Attribution page, and contact information.
 */

export function Footer() {
  return (
    <div className="mt-8 p-0 md:p-6">
      <footer className="bg-black/60 backdrop-blur-sm shadow-xl rounded-none md:rounded-lg border border-x-0 md:border-x border-white/20 p-6 text-center">
      <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
        <a
          href="/privacy.html"
          className="hover:text-white transition-colors"
        >
          Privacy Policy
        </a>
        <span className="text-white/40">·</span>
        <a
          href="/attribution.html"
          className="hover:text-white transition-colors"
        >
          Attribution
        </a>
        <span className="text-white/40">·</span>
        <a
          href="mailto:contact@myrakrusemark.com"
          className="hover:text-white transition-colors"
        >
          Contact
        </a>
      </div>
      <p className="mt-3 text-xs text-white/50">
        Made with bird sounds from{' '}
        <a
          href="https://xeno-canto.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/70 underline"
        >
          Xeno-canto
        </a>
        , photos from{' '}
        <a
          href="https://www.inaturalist.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/70 underline"
        >
          iNaturalist
        </a>
        , and descriptions from{' '}
        <a
          href="https://www.wikipedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/70 underline"
        >
          Wikipedia
        </a>
      </p>
      </footer>
    </div>
  );
}
