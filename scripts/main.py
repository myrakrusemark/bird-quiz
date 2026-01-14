#!/usr/bin/env python3
"""
Bird Dataset Collection Script - Modular Version

Fetches bird photos, audio recordings, spectrograms, and metadata from:
- Xeno-canto (audio + spectrograms)
- Wikipedia (descriptions)
- iNaturalist (photos)

Outputs a complete JSON dataset with cached media files.

Usage:
    python main.py --region missouri      # Collect Missouri birds
    python main.py --region west-coast    # Collect West Coast birds
    python main.py --region new-england   # Collect New England birds
    python main.py --test                 # Test mode (3 species)
    python main.py --help                 # Show help
"""

import sys
import argparse
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from logger import setup_logger
from config import LOG_LEVEL
from modules.builder import DatasetBuilder


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Collect bird dataset from Xeno-canto, Wikipedia, and Wikimedia Commons",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --region missouri      # Collect Missouri birds
  python main.py --region west-coast    # Collect West Coast birds
  python main.py --region new-england   # Collect New England birds
  python main.py --test                 # Test with 3 species
  python main.py --test 5               # Test with 5 species
  python main.py --verbose              # Show debug output
  python main.py --resume               # Resume from previous run
  python main.py --no-cache             # Disable API caching
  python main.py --clear-cache          # Clear cache and start fresh

Get your free Xeno-canto API key at: https://xeno-canto.org/api/guide
        """
    )

    parser.add_argument(
        '--test', '-t',
        nargs='?',
        type=int,
        const=3,
        metavar='N',
        help='Test mode: process only N species (default: 3)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose (DEBUG) logging'
    )

    parser.add_argument(
        '--resume', '-r',
        action='store_true',
        help='Resume from previous progress (skip completed species)'
    )

    parser.add_argument(
        '--no-cache',
        action='store_true',
        help='Disable API response caching (always fetch fresh data)'
    )

    parser.add_argument(
        '--clear-cache',
        action='store_true',
        help='Clear all cached data before starting'
    )

    parser.add_argument(
        '--region', '-R',
        type=str,
        choices=['missouri', 'west-coast', 'new-england'],
        default='missouri',
        help='Region to collect data for (default: missouri)'
    )

    return parser.parse_args()


def main() -> int:
    """Main entry point"""
    args = parse_arguments()

    # Setup logger with appropriate log level
    log_level = 'DEBUG' if args.verbose else LOG_LEVEL
    logger = setup_logger(__name__, log_level=log_level)

    # Dynamic species list import based on region
    region = args.region
    region_module_map = {
        'missouri': 'species_list_missouri',
        'west-coast': 'species_list_west_coast',
        'new-england': 'species_list_new_england'
    }

    module_name = region_module_map[region]
    logger.info(f"Loading species list for region: {region}")

    try:
        species_module = __import__(module_name)
        SPECIES_LIST = species_module.SPECIES_LIST
    except ImportError as e:
        logger.error(f"Failed to import species list for {region}: {e}")
        return 1

    try:
        # Create dataset builder
        use_cache = not args.no_cache
        builder = DatasetBuilder(use_cache=use_cache, region=region)

        # Clear cache if requested
        if args.clear_cache and builder.cache:
            logger.info("Clearing cache...")
            builder.cache.clear_all()
            builder.cache.clear_progress()

        # Build dataset
        test_mode = args.test is not None
        test_count = args.test if test_mode else 3

        dataset = builder.build_dataset(
            species_list=SPECIES_LIST,
            test_mode=test_mode,
            test_count=test_count,
            resume=args.resume
        )

        logger.info("Dataset collection completed successfully!")
        return 0

    except KeyboardInterrupt:
        logger.warning("\nCollection interrupted by user")
        return 130  # Standard exit code for SIGINT
    except Exception as e:
        logger.exception(f"Fatal error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
