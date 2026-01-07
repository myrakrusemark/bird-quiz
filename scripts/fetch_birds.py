#!/usr/bin/env python3
"""
Bird Dataset Collection Script

Fetches bird photos, audio recordings, spectrograms, and metadata from:
- Xeno-canto (audio + spectrograms)
- Wikipedia (photos + descriptions)

Outputs a complete JSON dataset with cached media files.
"""

import requests
import json
import time
import sys
import subprocess
from pathlib import Path
from datetime import datetime
from urllib.parse import quote
from typing import Dict, List, Optional

from config import (
    XENO_CANTO_API_KEY, XENO_CANTO_API_URL, WIKIPEDIA_API_URL,
    DATA_DIR, PHOTOS_DIR, AUDIO_DIR, SPECTROGRAMS_DIR, DATASET_FILE,
    QUALITY_FILTER, MAX_RECORDINGS_PER_SPECIES, MIN_RECORDINGS_PER_SPECIES,
    MAX_PHOTOS_PER_SPECIES, MIN_PHOTOS_PER_SPECIES,
    REQUEST_TIMEOUT, MAX_RETRIES, RETRY_DELAY, USER_AGENT
)
from species_list import SPECIES_LIST


def fetch_xeno_canto_recordings(genus: str, species: str, limit: int = MAX_RECORDINGS_PER_SPECIES) -> List[Dict]:
    """
    Fetch audio recordings from Xeno-canto API

    Args:
        genus: Bird genus (e.g., "Cardinalis")
        species: Bird species (e.g., "cardinalis")
        limit: Maximum number of recordings to fetch

    Returns:
        List of recording metadata dictionaries
    """
    query = f"gen:{genus} sp:{species}"
    params = {
        "query": query,
        "key": XENO_CANTO_API_KEY,
        "per_page": limit
    }
    headers = {"User-Agent": USER_AGENT}

    print(f"  Fetching recordings from Xeno-canto for {genus} {species}...")

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(
                XENO_CANTO_API_URL,
                params=params,
                headers=headers,
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            data = response.json()

            if "recordings" in data:
                recordings = data["recordings"]
                # Filter by quality if specified
                if QUALITY_FILTER:
                    recordings = [r for r in recordings if r.get("q") in QUALITY_FILTER]

                print(f"  Found {len(recordings)} recordings (quality filtered)")
                return recordings[:limit]
            else:
                print(f"  Warning: No recordings found in response")
                return []

        except requests.exceptions.RequestException as e:
            print(f"  Error fetching recordings (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (2 ** attempt))  # Exponential backoff
            else:
                print(f"  Failed to fetch recordings after {MAX_RETRIES} attempts")
                return []

    return []


def fetch_wikipedia_data(species_name: str) -> Optional[Dict]:
    """
    Fetch bird photo and description from Wikipedia

    Args:
        species_name: Common name (e.g., "Northern Cardinal") or scientific name

    Returns:
        Dictionary with photo URL, description, and metadata, or None if not found
    """
    # Replace spaces with underscores for Wikipedia URL
    wiki_title = species_name.replace(" ", "_")
    url = f"{WIKIPEDIA_API_URL}/{quote(wiki_title)}"
    headers = {"User-Agent": USER_AGENT}

    print(f"  Fetching Wikipedia data for {species_name}...")

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            data = response.json()

            result = {
                "description": data.get("extract", ""),
                "photoUrl": None,
                "photoThumbnail": None,
                "wikibaseItem": data.get("wikibase_item")
            }

            # Extract photo URLs if available
            if "originalimage" in data:
                result["photoUrl"] = data["originalimage"]["source"]
            if "thumbnail" in data:
                result["photoThumbnail"] = data["thumbnail"]["source"]

            if result["photoUrl"]:
                print(f"  Found Wikipedia photo and description")
            else:
                print(f"  Found description but no photo")

            return result

        except requests.exceptions.RequestException as e:
            print(f"  Error fetching Wikipedia data (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (2 ** attempt))
            else:
                print(f"  Failed to fetch Wikipedia data after {MAX_RETRIES} attempts")
                return None

    return None


def fetch_wikimedia_commons_photos(common_name: str, scientific_name: str, limit: int = 10) -> List[Dict]:
    """
    Fetch multiple bird photos from Wikimedia Commons

    Args:
        common_name: Common bird name (e.g., "Northern Cardinal")
        scientific_name: Scientific name (e.g., "Cardinalis cardinalis")
        limit: Maximum number of photos to fetch

    Returns:
        List of photo metadata with URLs and licenses
    """
    url = "https://commons.wikimedia.org/w/api.php"
    search_query = scientific_name  # Try scientific name first

    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": search_query,
        "gsrnamespace": "6",  # File namespace
        "gsrlimit": limit * 3,  # Fetch extra for filtering
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiurlwidth": "1024"  # Request reasonable size
    }

    headers = {"User-Agent": USER_AGENT}

    print(f"  Fetching photos from Wikimedia Commons for {common_name}...")

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, params=params, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            data = response.json()

            if "query" not in data or "pages" not in data["query"]:
                # Fallback to common name
                if search_query != common_name:
                    params["gsrsearch"] = common_name
                    continue
                return []

            photos = []
            pages = data["query"]["pages"]

            for page_id, page_data in pages.items():
                if "imageinfo" not in page_data:
                    continue

                image_info = page_data["imageinfo"][0]
                title = page_data.get("title", "")

                # Filter out icons, maps, diagrams
                if any(skip in title.lower() for skip in [
                    "icon", "logo", "map", "range", "distribution",
                    "diagram", "chart", "illustration.svg"
                ]):
                    continue

                # Filter by file size (too small = likely not a photo)
                if image_info.get("size", 0) < 50000:  # 50KB minimum
                    continue

                extmetadata = image_info.get("extmetadata", {})
                license_short = extmetadata.get("LicenseShortName", {}).get("value", "Unknown")
                attribution = extmetadata.get("Artist", {}).get("value", "Unknown")

                photos.append({
                    "url": image_info.get("url", ""),
                    "title": title,
                    "license": license_short,
                    "attribution": attribution
                })

                if len(photos) >= limit:
                    break

            if len(photos) > 0:
                print(f"  Found {len(photos)} photos from Wikimedia Commons")
                return photos[:limit]
            else:
                return []

        except requests.exceptions.RequestException as e:
            print(f"  Error fetching photos (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (2 ** attempt))

    return []


def validate_image_file(filepath: Path) -> bool:
    """
    Validate that a file is actually an image using the 'file' command

    Args:
        filepath: Path to the file to validate

    Returns:
        True if file is a valid image, False otherwise
    """
    try:
        result = subprocess.run(
            ['file', '--mime-type', '-b', str(filepath)],
            capture_output=True,
            text=True,
            timeout=5
        )
        mime_type = result.stdout.strip()

        # Check if it's an image MIME type
        is_image = mime_type.startswith('image/')

        if not is_image:
            print(f"    ⚠ File validation failed: {mime_type} (expected image/*)")

        return is_image
    except Exception as e:
        print(f"    ⚠ Error validating file: {e}")
        return False


def download_file(url: str, filepath: Path, description: str = "file", validate_as_image: bool = False) -> bool:
    """
    Download a file from URL and save to local path

    Args:
        url: URL to download from
        filepath: Local path to save to
        description: Description for progress message
        validate_as_image: If True, validate that downloaded file is an image

    Returns:
        True if successful, False otherwise
    """
    # Ensure URL has proper schema
    if url.startswith("//"):
        url = "https:" + url

    headers = {"User-Agent": USER_AGENT}

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT, stream=True)
            response.raise_for_status()

            # Create parent directory if it doesn't exist
            filepath.parent.mkdir(parents=True, exist_ok=True)

            # Download file
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            # Verify file was written
            if filepath.exists() and filepath.stat().st_size > 0:
                # Validate as image if requested
                if validate_as_image:
                    if not validate_image_file(filepath):
                        # Delete invalid file
                        filepath.unlink()
                        print(f"    ✗ Invalid image file, deleted")
                        return False
                return True
            else:
                print(f"    Warning: Downloaded {description} but file is empty")
                return False

        except requests.exceptions.RequestException as e:
            print(f"    Error downloading {description} (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (2 ** attempt))
            else:
                print(f"    Failed to download {description} after {MAX_RETRIES} attempts")
                return False

    return False


def process_species(species_info: Dict) -> Optional[Dict]:
    """
    Process a single bird species: fetch all data and download media

    Args:
        species_info: Species metadata from SPECIES_LIST

    Returns:
        Complete species data dictionary, or None if processing failed
    """
    species_id = species_info["id"]
    common_name = species_info["commonName"]
    scientific_name = species_info["scientificName"]
    genus = species_info["genus"]
    species = species_info["species"]

    print(f"\n{'='*60}")
    print(f"Processing: {common_name} ({scientific_name})")
    print(f"{'='*60}")

    # Initialize species data structure
    species_data = {
        "id": species_id,
        "commonName": common_name,
        "scientificName": scientific_name,
        "region": "North America",  # Default, can be refined from Wikipedia
        "description": "",
        "photos": [],
        "recordings": [],
        "stats": {
            "totalRecordings": 0,
            "recordingTypes": [],
            "totalPhotos": 0
        }
    }

    # Fetch Wikipedia data (for description only)
    wiki_data = fetch_wikipedia_data(common_name)
    if wiki_data:
        species_data["description"] = wiki_data["description"]

    # Fetch multiple photos from Wikimedia Commons
    commons_photos = fetch_wikimedia_commons_photos(common_name, scientific_name, MAX_PHOTOS_PER_SPECIES)

    if len(commons_photos) < MIN_PHOTOS_PER_SPECIES:
        print(f"  Warning: Only found {len(commons_photos)} photos (minimum is {MIN_PHOTOS_PER_SPECIES})")

    # Download each photo
    for idx, photo_data in enumerate(commons_photos, start=1):
        photo_filename = f"{species_id}-wikimedia-{idx}.jpg"
        photo_path = PHOTOS_DIR / photo_filename

        print(f"  Downloading photo {idx}/{len(commons_photos)}...")
        if download_file(photo_data["url"], photo_path, f"photo {idx}", validate_as_image=True):
            species_data["photos"].append({
                "url": photo_data["url"],
                "source": "wikimedia-commons",
                "license": photo_data.get("license", "Unknown"),
                "attribution": photo_data.get("attribution", "Unknown"),
                "cached": f"data/photos/{photo_filename}"
            })
            print(f"    ✓ Photo saved to {photo_filename}")
            # Add delay to avoid rate limiting from Wikimedia Commons
            time.sleep(1.5)

    # Fetch Xeno-canto recordings
    recordings = fetch_xeno_canto_recordings(genus, species)

    if len(recordings) < MIN_RECORDINGS_PER_SPECIES:
        print(f"  Warning: Only found {len(recordings)} recordings (minimum is {MIN_RECORDINGS_PER_SPECIES})")

    # Process each recording
    recording_types = set()
    for idx, rec in enumerate(recordings):
        recording_id = rec["id"]
        rec_type = rec.get("type", "unknown")
        recording_types.add(rec_type)

        print(f"  Processing recording {idx + 1}/{len(recordings)}: XC{recording_id} ({rec_type})")

        # Prepare file paths
        audio_filename = f"{species_id}-XC{recording_id}.mp3"
        spectro_filename = f"{species_id}-XC{recording_id}.png"
        audio_path = AUDIO_DIR / audio_filename
        spectro_path = SPECTROGRAMS_DIR / spectro_filename

        # Download audio file
        audio_url = rec.get("file", "")
        if audio_url:
            if download_file(audio_url, audio_path, f"audio XC{recording_id}"):
                print(f"    ✓ Audio saved")
            else:
                print(f"    ✗ Audio download failed")
                continue  # Skip this recording if audio fails

        # Download spectrogram
        spectro_url = rec.get("sono", {}).get("med", "") or rec.get("sono", {}).get("full", "")
        if spectro_url:
            if download_file(spectro_url, spectro_path, f"spectrogram XC{recording_id}"):
                print(f"    ✓ Spectrogram saved")
            else:
                print(f"    ✗ Spectrogram download failed")

        # Add recording metadata to species data
        species_data["recordings"].append({
            "id": f"XC{recording_id}",
            "type": rec_type,
            "audioUrl": audio_url,
            "spectrogramUrl": spectro_url,
            "quality": rec.get("q", "no score"),
            "duration": rec.get("length", ""),
            "location": f"{rec.get('loc', '')}, {rec.get('cnt', '')}".strip(", "),
            "recordist": rec.get("rec", ""),
            "date": rec.get("date", ""),
            "license": rec.get("lic", "").replace("//", "https://"),
            "cachedAudio": f"data/audio/{audio_filename}",
            "cachedSpectrogram": f"data/spectrograms/{spectro_filename}"
        })

    # Update statistics
    species_data["stats"]["totalRecordings"] = len(species_data["recordings"])
    species_data["stats"]["recordingTypes"] = sorted(list(recording_types))
    species_data["stats"]["totalPhotos"] = len(species_data["photos"])

    print(f"\n✓ Completed {common_name}:")
    print(f"  - {species_data['stats']['totalPhotos']} photo(s)")
    print(f"  - {species_data['stats']['totalRecordings']} recording(s)")
    print(f"  - Recording types: {', '.join(species_data['stats']['recordingTypes'])}")

    return species_data


def build_dataset(test_mode: bool = False, test_count: int = 3):
    """
    Main function to build the complete bird dataset

    Args:
        test_mode: If True, only process first few species for testing
        test_count: Number of species to process in test mode
    """
    print("\n" + "="*60)
    print("BIRD DATASET COLLECTION")
    print("="*60)

    # Ensure directories exist
    PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    SPECTROGRAMS_DIR.mkdir(parents=True, exist_ok=True)

    # Determine which species to process
    species_to_process = SPECIES_LIST[:test_count] if test_mode else SPECIES_LIST

    if test_mode:
        print(f"\n⚠ TEST MODE: Processing only {test_count} species")
    else:
        print(f"\nProcessing all {len(species_to_process)} species")

    # Process each species
    all_species_data = []
    successful = 0
    failed = 0

    for species_info in species_to_process:
        try:
            species_data = process_species(species_info)
            if species_data:
                all_species_data.append(species_data)
                successful += 1
            else:
                failed += 1
        except Exception as e:
            print(f"\n✗ Error processing {species_info['commonName']}: {e}")
            failed += 1

    # Build final dataset structure
    dataset = {
        "species": all_species_data,
        "metadata": {
            "version": "1.0",
            "created": datetime.now().strftime("%Y-%m-%d"),
            "totalSpecies": len(all_species_data),
            "dataSources": ["xeno-canto", "wikipedia"],
            "testMode": test_mode
        }
    }

    # Save to JSON file
    print(f"\n{'='*60}")
    print("Saving dataset to JSON...")
    print(f"{'='*60}")

    with open(DATASET_FILE, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    print(f"✓ Dataset saved to {DATASET_FILE}")

    # Print summary
    print(f"\n{'='*60}")
    print("COLLECTION SUMMARY")
    print(f"{'='*60}")
    print(f"Successful: {successful} species")
    print(f"Failed: {failed} species")
    print(f"\nTotal recordings: {sum(s['stats']['totalRecordings'] for s in all_species_data)}")
    print(f"Total photos: {sum(s['stats']['totalPhotos'] for s in all_species_data)}")
    print(f"\nDataset file: {DATASET_FILE}")
    print(f"Media files saved to: {DATA_DIR}/")
    print("="*60 + "\n")


if __name__ == "__main__":
    # Check for test mode argument
    test_mode = "--test" in sys.argv or "-t" in sys.argv

    try:
        build_dataset(test_mode=test_mode, test_count=3)
    except KeyboardInterrupt:
        print("\n\n⚠ Collection interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
