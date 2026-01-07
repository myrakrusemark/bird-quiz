#!/usr/bin/env python3
"""
Fetch Missing Bird Photos Script

Downloads photos from Wikimedia Commons only for bird species that have 0 photos
in the current dataset. Updates birds.json with new photo metadata.
"""

import json
import time
from pathlib import Path

# Import from existing scripts
from config import (
    DATA_DIR, PHOTOS_DIR, DATASET_FILE,
    MAX_PHOTOS_PER_SPECIES, MIN_PHOTOS_PER_SPECIES
)
from species_list import SPECIES_LIST
from fetch_birds import fetch_wikimedia_commons_photos, download_file


def main():
    """Main function to fetch missing photos"""
    print("\n" + "="*60)
    print("FETCH MISSING BIRD PHOTOS")
    print("="*60)

    # Ensure photos directory exists
    PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing dataset
    print(f"\nLoading dataset from {DATASET_FILE}...")
    try:
        with open(DATASET_FILE, 'r', encoding='utf-8') as f:
            dataset = json.load(f)
    except FileNotFoundError:
        print(f"✗ Error: Dataset file not found at {DATASET_FILE}")
        return
    except json.JSONDecodeError as e:
        print(f"✗ Error: Failed to parse dataset JSON: {e}")
        return

    # Create mapping of species IDs to full species definitions
    species_map = {s['id']: s for s in SPECIES_LIST}

    # Identify species with 0 photos
    species_without_photos = [
        s for s in dataset['species']
        if len(s.get('photos', [])) == 0
    ]

    if not species_without_photos:
        print("\n✓ All species already have photos!")
        return

    print(f"\nFound {len(species_without_photos)} species without photos:")
    for species in species_without_photos:
        print(f"  - {species['commonName']} ({species['id']})")

    print(f"\n{'='*60}")
    print("DOWNLOADING PHOTOS")
    print(f"{'='*60}")

    successful = 0
    failed = 0

    # Process each species without photos
    for species_data in species_without_photos:
        species_id = species_data['id']
        common_name = species_data['commonName']
        scientific_name = species_data['scientificName']

        print(f"\n{'='*60}")
        print(f"Processing: {common_name}")
        print(f"{'='*60}")

        # Fetch photos from Wikimedia Commons
        commons_photos = fetch_wikimedia_commons_photos(
            common_name,
            scientific_name,
            MAX_PHOTOS_PER_SPECIES
        )

        if len(commons_photos) == 0:
            print(f"  ✗ No photos found for {common_name}")
            failed += 1
            continue

        if len(commons_photos) < MIN_PHOTOS_PER_SPECIES:
            print(f"  Warning: Only found {len(commons_photos)} photos (minimum is {MIN_PHOTOS_PER_SPECIES})")

        # Download each photo
        photos_downloaded = 0
        for idx, photo_data in enumerate(commons_photos, start=1):
            photo_filename = f"{species_id}-wikimedia-{idx}.jpg"
            photo_path = PHOTOS_DIR / photo_filename

            print(f"  Downloading photo {idx}/{len(commons_photos)}...")
            if download_file(photo_data["url"], photo_path, f"photo {idx}"):
                # Add photo metadata to species data
                species_data["photos"].append({
                    "url": photo_data["url"],
                    "source": "wikimedia-commons",
                    "license": photo_data.get("license", "Unknown"),
                    "attribution": photo_data.get("attribution", "Unknown"),
                    "cached": f"data/photos/{photo_filename}"
                })
                print(f"    ✓ Photo saved to {photo_filename}")
                photos_downloaded += 1
                # Add delay to avoid rate limiting
                time.sleep(3.0)  # Increased from 1.5 to 3 seconds
            else:
                print(f"    ✗ Failed to download photo {idx}")

        # Update stats
        species_data["stats"]["totalPhotos"] = len(species_data["photos"])

        if photos_downloaded > 0:
            print(f"\n✓ Downloaded {photos_downloaded} photo(s) for {common_name}")
            successful += 1
        else:
            print(f"\n✗ Failed to download any photos for {common_name}")
            failed += 1

        # Add delay between species to avoid rate limiting
        print(f"  Waiting 10 seconds before next species...")
        time.sleep(10)

    # Save updated dataset
    print(f"\n{'='*60}")
    print("Saving updated dataset...")
    print(f"{'='*60}")

    try:
        with open(DATASET_FILE, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, indent=2, ensure_ascii=False)
        print(f"✓ Dataset saved to {DATASET_FILE}")
    except Exception as e:
        print(f"✗ Error saving dataset: {e}")
        return

    # Print summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Species with photos downloaded: {successful}")
    print(f"Species with no photos found: {failed}")
    print(f"\nTotal photos in dataset: {sum(s['stats']['totalPhotos'] for s in dataset['species'])}")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠ Download interrupted by user")
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
