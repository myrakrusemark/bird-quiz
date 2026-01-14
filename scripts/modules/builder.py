"""
Dataset builder module

Orchestrates the collection of bird data from multiple sources
and constructs the final dataset.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from logger import get_logger
from modules.xeno_canto import XenoCantoClient
from modules.wikipedia import WikipediaClient
from modules.inaturalist import iNaturalistClient
from modules.downloader import Downloader
from modules.cache import Cache
from config import (
    DATA_DIR, PHOTOS_DIR, AUDIO_DIR, DATASET_FILE,
    CACHE_DIR, CACHE_EXPIRY_DAYS,
    MIN_RECORDINGS_PER_SPECIES, MIN_PHOTOS_PER_SPECIES
)

logger = get_logger(__name__)


class DatasetBuilder:
    """Builds the bird dataset by collecting data from multiple sources"""

    def __init__(self, use_cache: bool = True):
        """
        Initialize dataset builder.

        Args:
            use_cache: Whether to use caching for API responses
        """
        self.xeno_canto = XenoCantoClient()
        self.wikipedia = WikipediaClient()
        self.inaturalist = iNaturalistClient()
        self.downloader = Downloader()

        # Initialize cache
        self.use_cache = use_cache
        self.cache = Cache(CACHE_DIR, cache_expiry_days=CACHE_EXPIRY_DAYS) if use_cache else None

        # Ensure directories exist
        PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)

        # Clean up expired cache entries
        if self.cache:
            self.cache.cleanup_expired()

    def process_species(self, species_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Process a single bird species and collect all data.

        Args:
            species_info: Dictionary with species metadata
                {
                    'id': str,
                    'commonName': str,
                    'scientificName': str,
                    'genus': str,
                    'species': str
                }

        Returns:
            Complete species data dictionary, or None if insufficient data
        """
        species_id = species_info['id']
        common_name = species_info['commonName']
        scientific_name = species_info['scientificName']
        genus = species_info['genus']
        species = species_info['species']

        logger.info("=" * 60)
        logger.info(f"Processing: {common_name} ({scientific_name})")
        logger.info("=" * 60)

        # Initialize species data structure
        species_data = {
            "id": species_id,
            "commonName": common_name,
            "scientificName": scientific_name,
            "description": "",
            "photos": [],
            "recordings": [],
            "stats": {
                "totalRecordings": 0,
                "recordingTypes": [],
                "totalPhotos": 0
            }
        }

        # 1. Fetch Wikipedia description (with caching)
        wiki_cache_key = f"wikipedia:{common_name}"
        wiki_data = self.cache.get(wiki_cache_key) if self.cache else None

        if not wiki_data:
            wiki_data = self.wikipedia.fetch_summary(common_name)
            if wiki_data and self.cache:
                self.cache.set(wiki_cache_key, wiki_data)

        if wiki_data:
            species_data["description"] = wiki_data.get("extract", "")

        # 2. Fetch photos from iNaturalist (with caching)
        photos_cache_key = f"inaturalist_photos:{scientific_name}"
        inaturalist_photos = self.cache.get(photos_cache_key) if self.cache else None

        if not inaturalist_photos:
            inaturalist_photos = self.inaturalist.fetch_photos(
                scientific_name=scientific_name,
                common_name=common_name
            )
            if inaturalist_photos and self.cache:
                self.cache.set(photos_cache_key, inaturalist_photos)

        if len(inaturalist_photos) < MIN_PHOTOS_PER_SPECIES:
            logger.warning(f"Only found {len(inaturalist_photos)} photos (minimum is {MIN_PHOTOS_PER_SPECIES})")

        # Download photos
        for idx, photo_data in enumerate(inaturalist_photos, 1):
            photo_filename = f"{species_id}-photo{idx}.jpg"
            photo_path = PHOTOS_DIR / photo_filename

            logger.info(f"Downloading photo {idx}/{len(inaturalist_photos)}...")

            # Download with automatic retry logic (has built-in exponential backoff)
            if self.downloader.download_photo(photo_data['url'], photo_path):
                species_data["photos"].append({
                    "url": photo_data['url'],
                    "source": "iNaturalist",
                    "license": photo_data.get('license', 'Unknown'),
                    "attribution": photo_data.get('attribution', 'Unknown'),
                    "observation_url": photo_data.get('observation_url', ''),
                    "cached": str(photo_path.relative_to(DATA_DIR.parent))
                })

        # 3. Fetch audio recordings from Xeno-canto (with caching)
        recordings_cache_key = f"xeno_canto:{genus}:{species}"
        recordings = self.cache.get(recordings_cache_key) if self.cache else None

        if not recordings:
            recordings = self.xeno_canto.fetch_recordings(genus, species)
            if recordings and self.cache:
                self.cache.set(recordings_cache_key, recordings)

        if len(recordings) < MIN_RECORDINGS_PER_SPECIES:
            logger.warning(f"Only found {len(recordings)} recordings (minimum is {MIN_RECORDINGS_PER_SPECIES})")

        # Download recordings and spectrograms
        recording_types = set()

        for idx, recording in enumerate(recordings, 1):
            recording_id = recording.get('id', str(idx))
            recording_type = recording.get('type', 'call')
            recording_types.add(recording_type)

            # Filenames
            audio_filename = f"{species_id}-audio{idx}.mp3"
            audio_path = AUDIO_DIR / audio_filename

            logger.info(f"Downloading recording {idx}/{len(recordings)} ({recording_type})...")

            # Download audio
            audio_url = f"https://xeno-canto.org/{recording_id}/download"
            audio_success = self.downloader.download_audio(audio_url, audio_path)

            if audio_success:
                species_data["recordings"].append({
                    "id": recording_id,
                    "type": recording_type,
                    "audioUrl": audio_url,
                    "quality": recording.get('q', 'no score'),
                    "duration": recording.get('length', 'Unknown'),
                    "location": recording.get('loc', 'Unknown'),
                    "recordist": recording.get('rec', 'Unknown'),
                    "date": recording.get('date', 'Unknown'),
                    "license": recording.get('lic', 'Unknown'),
                    "cachedAudio": str(audio_path.relative_to(DATA_DIR.parent))
                })

        # Update statistics
        species_data["stats"]["totalRecordings"] = len(species_data["recordings"])
        species_data["stats"]["recordingTypes"] = sorted(list(recording_types))
        species_data["stats"]["totalPhotos"] = len(species_data["photos"])

        # Log summary
        logger.info(f"Collected data for {common_name}:")
        logger.info(f"  - {species_data['stats']['totalPhotos']} photo(s)")
        logger.info(f"  - {species_data['stats']['totalRecordings']} recording(s)")
        logger.info(f"  - Recording types: {', '.join(species_data['stats']['recordingTypes'])}")

        return species_data

    def build_dataset(
        self,
        species_list:List[Dict[str, Any]],
        test_mode: bool = False,
        test_count: int = 3,
        resume: bool = False
    ) -> Dict[str, Any]:
        """
        Build complete dataset from species list.

        Args:
            species_list: List of species to process
            test_mode: If True, only process first few species
            test_count: Number of species to process in test mode
            resume: If True, resume from previous progress

        Returns:
            Complete dataset dictionary
        """
        logger.info("=" * 60)
        logger.info("BIRD DATASET COLLECTION")
        logger.info("=" * 60)

        # Determine which species to process
        species_to_process = species_list[:test_count] if test_mode else species_list

        if test_mode:
            logger.warning(f"TEST MODE: Processing only {test_count} species")
        else:
            logger.info(f"Processing all {len(species_to_process)} species")

        # Check for previous progress
        completed_ids = set()
        all_species_data = []

        if resume and self.cache:
            progress = self.cache.load_progress()
            completed_ids = set(progress.get('completed_species', {}).keys())

            if completed_ids:
                logger.info(f"Resuming from previous run: {len(completed_ids)} species already completed")

                # Load completed species data
                for species_id, entry in progress['completed_species'].items():
                    all_species_data.append(entry['data'])

                # Remove completed species from processing list
                species_to_process = [
                    s for s in species_to_process
                    if s['id'] not in completed_ids
                ]

                if not species_to_process:
                    logger.info("All species already completed!")
                else:
                    logger.info(f"Remaining: {len(species_to_process)} species to process")

        # Process each species
        successful = len(completed_ids)  # Count previously completed
        failed = 0

        for species_info in species_to_process:
            try:
                species_data = self.process_species(species_info)
                if species_data:
                    all_species_data.append(species_data)
                    successful += 1

                    # Save progress after each successful species
                    if self.cache:
                        self.cache.save_progress(species_info['id'], species_data)

                else:
                    failed += 1
            except Exception as e:
                logger.exception(f"Error processing {species_info['commonName']}: {e}")
                failed += 1

        # Load existing dataset if it exists
        existing_species_map = {}
        dataset_file = DATASET_FILE
        if dataset_file.exists():
            try:
                with open(dataset_file, 'r', encoding='utf-8') as f:
                    existing_dataset = json.load(f)
                    # Create map of existing species by ID
                    for species in existing_dataset.get('species', []):
                        existing_species_map[species['id']] = species
                    logger.info(f"Loaded {len(existing_species_map)} existing species from dataset")
            except Exception as e:
                logger.warning(f"Could not load existing dataset: {e}")

        # Merge new species data with existing data
        for species_data in all_species_data:
            existing_species_map[species_data['id']] = species_data

        # Build final dataset structure with merged data
        merged_species = list(existing_species_map.values())

        dataset = {
            "species": merged_species,
            "metadata": {
                "version": "2.0.0",
                "created": datetime.now().isoformat(),
                "totalSpecies": len(merged_species),
                "dataSources": [
                    "Xeno-canto (audio recordings)",
                    "iNaturalist (research-grade photos)",
                    "Wikipedia (descriptions)"
                ],
                "testMode": test_mode,
                "note": "Region-agnostic dataset. See regions.json for regional mappings."
            }
        }

        # Save to JSON file
        logger.info("=" * 60)
        logger.info("Saving dataset to JSON...")
        logger.info("=" * 60)

        with open(dataset_file, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, indent=2, ensure_ascii=False)

        logger.info(f"Dataset saved to {dataset_file}")

        # Print summary
        logger.info("=" * 60)
        logger.info("COLLECTION SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Successful: {successful} species")
        logger.info(f"Failed: {failed} species")
        total_recordings = sum(s['stats']['totalRecordings'] for s in all_species_data)
        total_photos = sum(s['stats']['totalPhotos'] for s in all_species_data)
        logger.info(f"Total recordings: {total_recordings}")
        logger.info(f"Total photos: {total_photos}")
        logger.info(f"Dataset file: {dataset_file}")
        logger.info(f"Media files saved to: {DATA_DIR}/")
        logger.info("=" * 60)

        return dataset
