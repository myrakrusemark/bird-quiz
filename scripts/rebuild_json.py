#!/usr/bin/env python3
"""
Rebuild birds.json from existing media files

Scans photos/ and audio/ directories and reconstructs the dataset JSON
using existing cached API data and file metadata.
"""

import sys
import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from logger import setup_logger
from config import DATA_DIR, PHOTOS_DIR, AUDIO_DIR, DATASET_FILE
from species_list_missouri import SPECIES_LIST
from modules.wikipedia import WikipediaClient
from modules.cache import Cache

logger = setup_logger(__name__)


def extract_species_id(filename: str) -> str:
    """
    Extract species ID from filename.

    Examples:
        northern-cardinal-photo1.jpg -> northern-cardinal
        american-robin-XC123456.mp3 -> american-robin
        blue-jay-audio5.mp3 -> blue-jay
    """
    # Remove extension
    name = filename.rsplit('.', 1)[0]

    # Match pattern: species-id-(photo|audio|XC)...
    # Also handle old formats like species-id-wikimedia-1
    patterns = [
        r'^([a-z-]+)-(photo|audio)\d+$',
        r'^([a-z-]+)-XC\d+$',
        r'^([a-z-]+)-(wikimedia|wikipedia|inaturalist)',
    ]

    for pattern in patterns:
        match = re.match(pattern, name)
        if match:
            return match.group(1)

    # Fallback: just take everything before first number or XC
    match = re.match(r'^([a-z-]+)', name)
    if match:
        return match.group(1)

    return name


def get_species_metadata(species_id: str) -> dict:
    """Get species metadata from species list"""
    for species in SPECIES_LIST:
        if species['id'] == species_id:
            return species

    # Fallback: create metadata from ID
    common_name = species_id.replace('-', ' ').title()
    logger.warning(f"Species '{species_id}' not found in SPECIES_LIST, using fallback")
    return {
        'id': species_id,
        'commonName': common_name,
        'scientificName': common_name,
        'genus': common_name.split()[0],
        'species': common_name.split()[-1].lower(),
        'region': 'Unknown'
    }


def scan_media_files():
    """Scan media directories and group files by species"""
    logger.info("Scanning media files...")

    species_files = defaultdict(lambda: {'photos': [], 'audio': []})

    # Scan photos
    if PHOTOS_DIR.exists():
        for photo_file in PHOTOS_DIR.glob('*.jpg'):
            species_id = extract_species_id(photo_file.name)
            species_files[species_id]['photos'].append(photo_file)

    # Scan audio
    if AUDIO_DIR.exists():
        for audio_file in AUDIO_DIR.glob('*.mp3'):
            species_id = extract_species_id(audio_file.name)
            species_files[species_id]['audio'].append(audio_file)

    # Sort files for consistent ordering
    for species_id in species_files:
        species_files[species_id]['photos'].sort()
        species_files[species_id]['audio'].sort()

    logger.info(f"Found {len(species_files)} species with media files")
    return species_files


def rebuild_dataset():
    """Rebuild the complete dataset from existing files"""
    logger.info("=" * 60)
    logger.info("REBUILDING DATASET FROM EXISTING FILES")
    logger.info("=" * 60)

    # Initialize clients
    wikipedia = WikipediaClient()
    cache = Cache(DATA_DIR / ".cache")

    # Scan existing media
    species_files = scan_media_files()

    # Build dataset
    all_species_data = []

    for species_id in sorted(species_files.keys()):
        files = species_files[species_id]

        # Get species metadata
        species_info = get_species_metadata(species_id)
        common_name = species_info['commonName']
        scientific_name = species_info['scientificName']

        logger.info(f"Processing: {common_name} ({scientific_name})")
        logger.info(f"  - {len(files['photos'])} photo(s)")
        logger.info(f"  - {len(files['audio'])} audio file(s)")

        # Initialize species data
        species_data = {
            "id": species_id,
            "commonName": common_name,
            "scientificName": scientific_name,
            "region": species_info.get('region', 'North America'),
            "description": "",
            "photos": [],
            "recordings": [],
            "stats": {
                "totalRecordings": 0,
                "recordingTypes": [],
                "totalPhotos": 0
            }
        }

        # Fetch Wikipedia description (with caching)
        wiki_cache_key = f"wikipedia:{common_name}"
        wiki_data = cache.get(wiki_cache_key)

        if not wiki_data:
            try:
                wiki_data = wikipedia.fetch_summary(common_name)
                if wiki_data:
                    cache.set(wiki_cache_key, wiki_data)
            except Exception as e:
                logger.warning(f"Could not fetch Wikipedia data for {common_name}: {e}")

        if wiki_data:
            species_data["description"] = wiki_data.get("extract", "")

        # Process photos
        for photo_file in files['photos']:
            relative_path = photo_file.relative_to(DATA_DIR.parent)
            species_data["photos"].append({
                "url": "",  # Original URL unknown
                "source": "Cached",
                "license": "Unknown",
                "attribution": "Unknown",
                "cached": str(relative_path)
            })

        # Process audio files
        for audio_file in files['audio']:
            relative_path = audio_file.relative_to(DATA_DIR.parent)

            # Try to extract XC ID from filename
            xc_match = re.search(r'XC(\d+)', audio_file.name)
            recording_id = xc_match.group(1) if xc_match else "unknown"

            species_data["recordings"].append({
                "id": recording_id,
                "type": "unknown",
                "audioUrl": f"https://xeno-canto.org/{recording_id}/download" if recording_id != "unknown" else "",
                "quality": "unknown",
                "duration": "Unknown",
                "location": "Unknown",
                "recordist": "Unknown",
                "date": "Unknown",
                "license": "Unknown",
                "cachedAudio": str(relative_path)
            })

        # Update stats
        species_data["stats"]["totalPhotos"] = len(species_data["photos"])
        species_data["stats"]["totalRecordings"] = len(species_data["recordings"])

        all_species_data.append(species_data)

    # Build final dataset
    dataset = {
        "species": all_species_data,
        "metadata": {
            "version": "1.0",
            "created": datetime.now().strftime("%Y-%m-%d"),
            "totalSpecies": len(all_species_data),
            "dataSources": ["xeno-canto", "wikipedia", "inaturalist"],
            "rebuilt": True,
            "note": "Rebuilt from existing media files"
        }
    }

    # Save to JSON
    logger.info("=" * 60)
    logger.info("Saving dataset to JSON...")
    logger.info("=" * 60)

    with open(DATASET_FILE, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    logger.info(f"Dataset saved to {DATASET_FILE}")

    # Print summary
    logger.info("=" * 60)
    logger.info("REBUILD SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Total species: {len(all_species_data)}")
    total_photos = sum(s['stats']['totalPhotos'] for s in all_species_data)
    total_recordings = sum(s['stats']['totalRecordings'] for s in all_species_data)
    logger.info(f"Total photos: {total_photos}")
    logger.info(f"Total recordings: {total_recordings}")
    logger.info(f"Dataset file: {DATASET_FILE}")
    logger.info("=" * 60)

    return dataset


if __name__ == "__main__":
    try:
        rebuild_dataset()
        logger.info("Dataset rebuilt successfully!")
    except Exception as e:
        logger.exception(f"Error rebuilding dataset: {e}")
        sys.exit(1)
