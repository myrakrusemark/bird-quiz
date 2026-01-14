#!/usr/bin/env python3
"""
Migration script to create unified bird dataset architecture.

This script:
1. Loads birds-missouri.json as the base (contains all 20 species)
2. Strips 'region' field from all Bird objects
3. Generates new birds.json with unified dataset
4. Updates regions.json with species ID arrays for each region
"""

import json
from datetime import datetime
from pathlib import Path

# Import existing species lists to build region mappings
from species_list_missouri import SPECIES_LIST as missouri_species
from species_list_west_coast import SPECIES_LIST as west_coast_species
from species_list_new_england import SPECIES_LIST as new_england_species

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / 'data'
MISSOURI_JSON = DATA_DIR / 'birds-missouri.json'
BIRDS_JSON = DATA_DIR / 'birds.json'
REGIONS_JSON = DATA_DIR / 'regions.json'


def load_json(file_path: Path) -> dict:
    """Load JSON file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data: dict, file_path: Path) -> None:
    """Save JSON file with pretty formatting"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved: {file_path}")


def create_unified_birds_dataset():
    """
    Create unified birds.json from Missouri dataset.
    Strips 'region' field from all birds.
    """
    print("\n📦 Creating unified birds.json...")

    # Load Missouri dataset (contains all 20 species)
    missouri_data = load_json(MISSOURI_JSON)
    print(f"  Loaded {len(missouri_data['species'])} species from Missouri dataset")

    # Strip 'region' field from each bird
    unified_species = []
    for bird in missouri_data['species']:
        bird_copy = bird.copy()
        if 'region' in bird_copy:
            del bird_copy['region']
        unified_species.append(bird_copy)

    # Create new unified dataset
    unified_data = {
        'species': unified_species,
        'metadata': {
            'version': '2.0.0',
            'created': datetime.now().isoformat(),
            'totalSpecies': len(unified_species),
            'dataSources': [
                'Xeno-canto (audio recordings)',
                'iNaturalist (research-grade photos)',
                'Wikipedia (descriptions)'
            ],
            'note': 'Region-agnostic dataset. See regions.json for regional mappings.'
        }
    }

    # Save unified dataset
    save_json(unified_data, BIRDS_JSON)
    print(f"  ✓ Created unified dataset with {len(unified_species)} species")
    print(f"  ✓ Removed 'region' field from all birds")

    return unified_data


def create_enhanced_regions_config():
    """
    Update regions.json with species ID arrays.
    Removes 'datasetFile' field, adds 'species' array.
    """
    print("\n🌎 Updating regions.json with species mappings...")

    # Load current regions.json
    current_regions = load_json(REGIONS_JSON)

    # Extract species IDs from each region's species list
    region_species_map = {
        'missouri': [s['id'] for s in missouri_species],
        'west-coast': [s['id'] for s in west_coast_species],
        'new-england': [s['id'] for s in new_england_species]
    }

    # Since Missouri list only has 5 species but the full dataset has 20,
    # we need to use the full species list from birds-missouri.json
    missouri_data = load_json(MISSOURI_JSON)
    region_species_map['missouri'] = [s['id'] for s in missouri_data['species']]

    print(f"  Missouri: {len(region_species_map['missouri'])} species")
    print(f"  West Coast: {len(region_species_map['west-coast'])} species")
    print(f"  New England: {len(region_species_map['new-england'])} species")

    # Update each region config
    for region in current_regions['regions']:
        region_id = region['id']

        # Remove 'datasetFile' field
        if 'datasetFile' in region:
            del region['datasetFile']

        # Add 'species' array
        region['species'] = region_species_map.get(region_id, [])

    # Add metadata section
    current_regions['metadata'] = {
        'version': '2.0.0',
        'updated': datetime.now().isoformat(),
        'totalRegions': len(current_regions['regions']),
        'totalUniqueSpecies': 20
    }

    # Save enhanced regions config
    save_json(current_regions, REGIONS_JSON)
    print("  ✓ Removed 'datasetFile' field from all regions")
    print("  ✓ Added 'species' arrays to all regions")
    print("  ✓ Added metadata section")

    return current_regions


def verify_migration():
    """Verify the migration was successful"""
    print("\n✅ Verifying migration...")

    # Check birds.json
    birds_data = load_json(BIRDS_JSON)
    assert len(birds_data['species']) == 20, "Expected 20 species in birds.json"

    # Verify no 'region' field in any bird
    for bird in birds_data['species']:
        assert 'region' not in bird, f"Found 'region' field in bird: {bird['id']}"

    # Verify metadata doesn't have region
    assert 'region' not in birds_data['metadata'], "Found 'region' in metadata"

    print("  ✓ birds.json: 20 species, no 'region' fields")

    # Check regions.json
    regions_data = load_json(REGIONS_JSON)
    for region in regions_data['regions']:
        assert 'datasetFile' not in region, f"Found 'datasetFile' in region: {region['id']}"
        assert 'species' in region, f"Missing 'species' array in region: {region['id']}"
        assert len(region['species']) > 0, f"Empty 'species' array in region: {region['id']}"

    print("  ✓ regions.json: All regions have 'species' arrays, no 'datasetFile' fields")
    print("\n🎉 Migration completed successfully!")
    print(f"\n📁 Generated files:")
    print(f"  - {BIRDS_JSON}")
    print(f"  - {REGIONS_JSON}")
    print(f"\n⚠️  Old files still present (for backup):")
    print(f"  - {DATA_DIR}/birds-missouri.json")
    print(f"  - {DATA_DIR}/birds-west-coast.json")
    print(f"  - {DATA_DIR}/birds-new-england.json")
    print(f"\n💡 Next steps:")
    print(f"  1. Test the frontend to verify everything works")
    print(f"  2. Delete old JSON files once confirmed")


def main():
    """Run the migration"""
    print("=" * 70)
    print("🔄 Bird Dataset Migration: Unified Architecture")
    print("=" * 70)

    # Create unified birds.json
    unified_data = create_unified_birds_dataset()

    # Update regions.json
    regions_data = create_enhanced_regions_config()

    # Verify migration
    verify_migration()


if __name__ == '__main__':
    main()
