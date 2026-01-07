# Bird Dataset Pipeline Documentation

Complete guide for creating, reading, updating, and deleting (CRUD) data in the bird dataset.

## Table of Contents
- [Quick Start](#quick-start)
- [Running the Collection Pipeline](#running-the-collection-pipeline)
- [Dataset Structure](#dataset-structure)
- [CRUD Operations](#crud-operations)
- [Maintenance Tasks](#maintenance-tasks)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Initial Collection
```bash
# Test with 3 species first
cd /home/myra/bird-dataset/scripts
python3 fetch_birds.py --test

# Run full collection (all 20 species)
python3 fetch_birds.py
```

### File Locations
- **Dataset**: `/home/myra/bird-dataset/data/birds.json`
- **Scripts**: `/home/myra/bird-dataset/scripts/`
- **Media**: `/home/myra/bird-dataset/data/{photos,audio,spectrograms}/`

---

## Running the Collection Pipeline

### Full Collection
Collects all species defined in `species_list.py`:
```bash
cd /home/myra/bird-dataset/scripts
python3 fetch_birds.py
```

### Test Mode
Collects only the first 3 species for testing:
```bash
python3 fetch_birds.py --test
# or
python3 fetch_birds.py -t
```

### What the Pipeline Does
1. **Fetches metadata** from Xeno-canto API (audio recordings)
2. **Fetches photos/descriptions** from Wikipedia API
3. **Downloads and caches** all media files locally
4. **Generates** `birds.json` with complete dataset
5. **Reports** success/failure statistics

### Expected Output
```
Processing: Northern Cardinal (Cardinalis cardinalis)
  Fetching recordings from Xeno-canto...
  Found 15 recordings (quality filtered)
  Fetching Wikipedia data...
  Found Wikipedia photo and description
  Downloading Wikipedia photo...
    ✓ Photo saved
  Processing recording 1/15: XC468374 (song)
    ✓ Audio saved
    ✓ Spectrogram saved
  ...

✓ Completed Northern Cardinal:
  - 1 photo(s)
  - 15 recording(s)
  - Recording types: song, call
```

---

## Dataset Structure

### JSON Schema
```json
{
  "species": [
    {
      "id": "northern-cardinal",
      "commonName": "Northern Cardinal",
      "scientificName": "Cardinalis cardinalis",
      "region": "North America",
      "description": "Wikipedia description text...",
      "photos": [
        {
          "url": "https://...",
          "source": "wikipedia",
          "license": "CC BY-SA 4.0",
          "cached": "data/photos/northern-cardinal-wikipedia.jpg"
        }
      ],
      "recordings": [
        {
          "id": "XC468374",
          "type": "song",
          "audioUrl": "https://xeno-canto.org/468374/download",
          "spectrogramUrl": "https://...",
          "quality": "A",
          "duration": "0:26",
          "location": "New York, USA",
          "recordist": "Giuseppe Speranza",
          "date": "2019-04-09",
          "license": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
          "cachedAudio": "data/audio/northern-cardinal-XC468374.mp3",
          "cachedSpectrogram": "data/spectrograms/northern-cardinal-XC468374.png"
        }
      ],
      "stats": {
        "totalRecordings": 15,
        "recordingTypes": ["song", "call"],
        "totalPhotos": 1
      }
    }
  ],
  "metadata": {
    "version": "1.0",
    "created": "2026-01-06",
    "totalSpecies": 20,
    "dataSources": ["xeno-canto", "wikipedia"]
  }
}
```

### File Naming Conventions
- **Photos**: `{species-id}-wikipedia.jpg`
- **Audio**: `{species-id}-XC{recording-id}.mp3`
- **Spectrograms**: `{species-id}-XC{recording-id}.png`

---

## CRUD Operations

### Create: Add New Species

#### 1. Add to Species List
Edit `scripts/species_list.py` and add your species to `SPECIES_LIST`:

```python
{
    "id": "house-wren",  # Unique ID (lowercase, hyphenated)
    "commonName": "House Wren",
    "scientificName": "Troglodytes aedon",
    "genus": "Troglodytes",  # For Xeno-canto API query
    "species": "aedon"       # For Xeno-canto API query
}
```

**How to find genus and species:**
- Search bird on Wikipedia
- Scientific name format: `Genus species`
- Example: "Troglodytes aedon" → genus="Troglodytes", species="aedon"

#### 2. Run Collection
```bash
cd /home/myra/bird-dataset/scripts
python3 fetch_birds.py
```

The pipeline will fetch data for ALL species in the list and regenerate `birds.json`.

#### 3. Collect Single Species Only
To collect just one species without re-fetching everything, create a temporary script:

```bash
cd /home/myra/bird-dataset/scripts
python3 -c "
from fetch_birds import process_species
import json

# Define your single species
species = {
    'id': 'house-wren',
    'commonName': 'House Wren',
    'scientificName': 'Troglodytes aedon',
    'genus': 'Troglodytes',
    'species': 'aedon'
}

# Fetch data
data = process_species(species)

# Load existing dataset
with open('../data/birds.json', 'r') as f:
    dataset = json.load(f)

# Add new species
dataset['species'].append(data)
dataset['metadata']['totalSpecies'] = len(dataset['species'])

# Save
with open('../data/birds.json', 'w') as f:
    json.dump(dataset, f, indent=2)

print(f'Added {species[\"commonName\"]} to dataset')
"
```

---

### Read: Query the Dataset

#### Load Dataset in Python
```python
import json

# Load dataset
with open('/home/myra/bird-dataset/data/birds.json', 'r') as f:
    dataset = json.load(f)

# Get all species
for species in dataset['species']:
    print(f"{species['commonName']}: {species['stats']['totalRecordings']} recordings")

# Find specific species
cardinal = next(s for s in dataset['species'] if s['id'] == 'northern-cardinal')
print(cardinal['description'])

# Get all song recordings for a species
songs = [r for r in cardinal['recordings'] if 'song' in r['type']]
print(f"Found {len(songs)} song recordings")
```

#### Query from Command Line
```bash
# List all species
python3 -c "import json; data=json.load(open('data/birds.json')); [print(f\"{s['commonName']}: {s['stats']['totalRecordings']} recordings\") for s in data['species']]"

# Count total recordings
python3 -c "import json; data=json.load(open('data/birds.json')); print(sum(s['stats']['totalRecordings'] for s in data['species']))"

# Find species by name
python3 -c "import json; data=json.load(open('data/birds.json')); cardinal=[s for s in data['species'] if 'cardinal' in s['commonName'].lower()]; print(cardinal[0]['scientificName'] if cardinal else 'Not found')"
```

---

### Update: Refresh Species Data

#### Update Single Species
1. **Remove old data** (see Delete section below)
2. **Re-fetch** using single-species collection script above

#### Update All Species
Simply re-run the full pipeline:
```bash
cd /home/myra/bird-dataset/scripts
python3 fetch_birds.py
```

**Warning**: This will:
- Overwrite `birds.json` completely
- Re-download ALL media files
- Replace existing data

#### Update Configuration Settings

**Change recording limits:**
Edit `scripts/config.py`:
```python
MAX_RECORDINGS_PER_SPECIES = 20  # Increase from 15
QUALITY_FILTER = ["A", "B"]      # Only high-quality recordings
```

**Change API settings:**
```python
REQUEST_TIMEOUT = 60      # Increase timeout for slow connections
MAX_RETRIES = 5           # More retry attempts
```

---

### Delete: Remove Species

#### Remove from Dataset
```bash
python3 << 'EOF'
import json

# Load dataset
with open('/home/myra/bird-dataset/data/birds.json', 'r') as f:
    dataset = json.load(f)

# Remove species by ID
species_to_remove = 'house-sparrow'
dataset['species'] = [s for s in dataset['species'] if s['id'] != species_to_remove]

# Update metadata
dataset['metadata']['totalSpecies'] = len(dataset['species'])

# Save
with open('/home/myra/bird-dataset/data/birds.json', 'w') as f:
    json.dump(dataset, f, indent=2, ensure_ascii=False)

print(f"Removed {species_to_remove}")
EOF
```

#### Clean Up Media Files
After removing from JSON, delete associated media:

```bash
# Remove all files for a species
SPECIES_ID="house-sparrow"
rm -f data/photos/${SPECIES_ID}-*.jpg
rm -f data/audio/${SPECIES_ID}-*.mp3
rm -f data/spectrograms/${SPECIES_ID}-*.png
echo "Deleted media files for ${SPECIES_ID}"
```

#### Remove from Species List
Edit `scripts/species_list.py` and remove the species entry to prevent re-collection.

---

## Maintenance Tasks

### Backup Dataset
```bash
# Backup entire dataset
tar -czf bird-dataset-backup-$(date +%Y%m%d).tar.gz /home/myra/bird-dataset/data/

# Backup just JSON (lightweight)
cp /home/myra/bird-dataset/data/birds.json \
   /home/myra/bird-dataset/data/birds.json.backup.$(date +%Y%m%d)
```

### Verify Data Integrity
```bash
cd /home/myra/bird-dataset

# Check for missing files
python3 << 'EOF'
import json
from pathlib import Path

with open('data/birds.json', 'r') as f:
    dataset = json.load(f)

missing = []
for species in dataset['species']:
    # Check photos
    for photo in species['photos']:
        path = Path(photo['cached'])
        if not path.exists():
            missing.append(str(path))

    # Check recordings
    for rec in species['recordings']:
        audio_path = Path(rec['cachedAudio'])
        spectro_path = Path(rec['cachedSpectrogram'])
        if not audio_path.exists():
            missing.append(str(audio_path))
        if not spectro_path.exists():
            missing.append(str(spectro_path))

if missing:
    print(f"Missing {len(missing)} files:")
    for f in missing[:10]:  # Show first 10
        print(f"  - {f}")
else:
    print("✓ All media files present")
EOF
```

### Clean Up Orphaned Files
```bash
# Find media files not referenced in birds.json
cd /home/myra/bird-dataset

python3 << 'EOF'
import json
from pathlib import Path

with open('data/birds.json', 'r') as f:
    dataset = json.load(f)

# Get all referenced files
referenced = set()
for species in dataset['species']:
    for photo in species['photos']:
        referenced.add(Path(photo['cached']).name)
    for rec in species['recordings']:
        referenced.add(Path(rec['cachedAudio']).name)
        referenced.add(Path(rec['cachedSpectrogram']).name)

# Find orphaned files
orphaned = []
for dir_name in ['photos', 'audio', 'spectrograms']:
    dir_path = Path(f'data/{dir_name}')
    for file in dir_path.glob('*'):
        if file.name not in referenced:
            orphaned.append(file)

if orphaned:
    print(f"Found {len(orphaned)} orphaned files:")
    for f in orphaned[:10]:
        print(f"  - {f}")

    response = input("\nDelete orphaned files? [y/N]: ")
    if response.lower() == 'y':
        for f in orphaned:
            f.unlink()
        print("Deleted orphaned files")
else:
    print("✓ No orphaned files")
EOF
```

### Export to Different Format

#### Export to CSV
```python
import json
import csv

# Load dataset
with open('data/birds.json', 'r') as f:
    dataset = json.load(f)

# Create CSV
with open('data/birds.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Common Name', 'Scientific Name', 'Region', 'Total Recordings', 'Total Photos'])

    for species in dataset['species']:
        writer.writerow([
            species['commonName'],
            species['scientificName'],
            species['region'],
            species['stats']['totalRecordings'],
            species['stats']['totalPhotos']
        ])

print("Exported to birds.csv")
```

---

## Troubleshooting

### API Errors

**"Invalid API key"**
- Check `scripts/config.py` has correct `XENO_CANTO_API_KEY`
- Verify key at https://xeno-canto.org/account

**"No recordings found"**
- Check scientific name is correct (genus and species)
- Try searching manually on xeno-canto.org first
- Some species may have limited recordings

**Wikipedia API errors**
- Check species name spelling
- Try alternative names (common name vs scientific name)
- Some species may not have Wikipedia pages

### Download Failures

**Timeout errors**
- Increase `REQUEST_TIMEOUT` in `config.py`
- Check internet connection
- Some files may be large (>10MB)

**Missing files after collection**
- Check disk space: `df -h /home/myra/bird-dataset/`
- Check write permissions: `ls -ld /home/myra/bird-dataset/data`
- Run integrity check (see Maintenance section)

### Performance Issues

**Collection too slow**
- Reduce `MAX_RECORDINGS_PER_SPECIES` in `config.py`
- Use `--test` mode for development
- Check network speed

**Out of disk space**
- Each species: ~5-10MB (15 recordings + spectrograms + photo)
- 20 species: ~100-200MB total
- Clean up orphaned files (see Maintenance section)

---

## Configuration Reference

### `scripts/config.py`

| Setting | Default | Description |
|---------|---------|-------------|
| `XENO_CANTO_API_KEY` | (your key) | API key from xeno-canto.org |
| `QUALITY_FILTER` | `["A", "B", "no score"]` | Accepted quality ratings |
| `MAX_RECORDINGS_PER_SPECIES` | `15` | Max recordings to fetch |
| `MIN_RECORDINGS_PER_SPECIES` | `3` | Minimum to consider complete |
| `REQUEST_TIMEOUT` | `30` | Seconds before timeout |
| `MAX_RETRIES` | `3` | Number of retry attempts |
| `RETRY_DELAY` | `2` | Base delay for exponential backoff |

### Quality Ratings (Xeno-canto)
- **A**: Excellent quality
- **B**: Good quality
- **C**: Average quality
- **D**: Poor quality
- **E**: Very poor quality
- **no score**: Unrated

---

## Tips & Best Practices

1. **Always test first**: Use `--test` mode before full collection
2. **Backup before updates**: Copy `birds.json` before major changes
3. **Verify species names**: Check Wikipedia/Xeno-canto before adding
4. **Monitor disk space**: ~10MB per species on average
5. **Check licenses**: Different recordings may have different CC licenses
6. **Keep API key private**: Don't commit `config.py` to public repos

---

## Future Enhancements

Potential improvements to the pipeline:

- [ ] Resume interrupted collections
- [ ] Incremental updates (only fetch new recordings)
- [ ] Parallel downloads for faster collection
- [ ] SQLite database option
- [ ] Web UI for browsing dataset
- [ ] Automatic duplicate detection
- [ ] Custom recording filters (date range, location, etc.)
- [ ] Generate spectrograms from audio locally
- [ ] Support for other APIs (eBird, iNaturalist, etc.)
