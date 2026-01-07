# Bird Sound Learning Dataset

A multi-modal dataset of 20 common North American backyard birds, designed for building educational flashcard games and bird sound learning applications.

## Overview

This dataset combines photos, audio recordings, spectrograms, and metadata for each bird species to enable multi-modal learning experiences. The hypothesis is that presenting information across different modalities (visual, auditory, spectral) enhances memory retention and comprehension.

## Dataset Contents

For each of the 20 bird species, the dataset includes:

- **Common and scientific names**
- **Geographic region** information
- **Species description** from Wikipedia
- **Photos** (high-resolution bird images)
- **Audio recordings** (10-15 high-quality MP3 files per species)
- **Spectrograms** (visual representations of each audio recording)
- **Metadata** for each recording (type, location, recordist, date, quality rating)

## Target Species

The dataset focuses on 20 common North American backyard birds:

1. Northern Cardinal
2. American Robin
3. Blue Jay
4. Black-capped Chickadee
5. American Crow
6. Mourning Dove
7. Red-winged Blackbird
8. Northern Mockingbird
9. American Goldfinch
10. House Sparrow
11. Song Sparrow
12. Downy Woodpecker
13. Eastern Bluebird
14. House Finch
15. Tufted Titmouse
16. White-breasted Nuthatch
17. Carolina Wren
18. Common Grackle
19. Cedar Waxwing
20. Baltimore Oriole

## Data Sources

This dataset aggregates data from two primary sources:

### Xeno-canto (xeno-canto.org)
- Audio recordings and spectrograms
- Recording metadata (location, recordist, date, quality)
- Creative Commons licensed content
- **Attribution**: Please credit individual recordists as specified in the dataset

### Wikipedia / Wikimedia Commons
- Bird photographs
- Species descriptions
- Geographic distribution information
- Various Creative Commons licenses
- **Attribution**: Please credit photographers as specified in the dataset

## File Structure

```
bird-dataset/
├── README.md                    # This file
├── data/
│   ├── birds.json               # Main dataset file with all metadata
│   ├── photos/                  # Cached bird photographs
│   ├── audio/                   # Cached audio recordings (MP3)
│   └── spectrograms/            # Cached spectrogram images (PNG)
└── scripts/                     # Data collection scripts (Python)
```

## Dataset Format

The main dataset is stored in `data/birds.json` with the following structure:

```json
{
  "species": [
    {
      "id": "northern-cardinal",
      "commonName": "Northern Cardinal",
      "scientificName": "Cardinalis cardinalis",
      "region": "Eastern and Central North America",
      "description": "Species description from Wikipedia...",
      "photos": [
        {
          "url": "Original photo URL",
          "source": "wikipedia",
          "license": "CC BY-SA 4.0",
          "cached": "data/photos/northern-cardinal-1.jpg"
        }
      ],
      "recordings": [
        {
          "id": "XC468374",
          "type": "song",
          "audioUrl": "Original audio URL",
          "spectrogramUrl": "Original spectrogram URL",
          "quality": "A",
          "duration": "0:26",
          "location": "New York, USA",
          "recordist": "Giuseppe Speranza",
          "date": "2019-04-09",
          "license": "CC BY-NC-SA 4.0",
          "cachedAudio": "data/audio/northern-cardinal-XC468374.mp3",
          "cachedSpectrogram": "data/spectrograms/northern-cardinal-XC468374.png"
        }
      ],
      "stats": {
        "totalRecordings": 12,
        "recordingTypes": ["song", "call"],
        "totalPhotos": 2
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

## Usage

### Loading the Dataset (Python)

```python
import json

# Load the dataset
with open('data/birds.json', 'r') as f:
    dataset = json.load(f)

# Access species data
for species in dataset['species']:
    print(f"{species['commonName']} ({species['scientificName']})")
    print(f"  Recordings: {species['stats']['totalRecordings']}")
    print(f"  Photos: {species['stats']['totalPhotos']}")
```

### Building a Flashcard Game

Example use cases:
- Show a photo → user selects correct spectrogram from multiple choices
- Play audio → user identifies bird from photo options
- Show spectrogram → user selects correct bird name
- Mixed-modality questions for enhanced learning

## License and Attribution

This dataset aggregates content from multiple sources under Creative Commons licenses. When using this dataset:

1. **Credit individual contributors**: Each recording and photo includes attribution information
2. **Respect license terms**: Most content is CC BY-NC-SA (attribution, non-commercial, share-alike)
3. **Check individual licenses**: Licenses may vary between recordings and photos

### Required Attribution Format

When displaying or using media from this dataset, please include:
- For recordings: "Recording by [recordist name] (xeno-canto.org/[ID])"
- For photos: "Photo: [photo source and license]"

## Data Collection

The dataset was collected using Python scripts that query:
- Xeno-canto API (v3) for audio recordings and spectrograms
- Wikipedia REST API for photos and descriptions

### Quick Start

```bash
# Test with 3 species first
cd scripts/
python3 fetch_birds.py --test

# Run full collection (all 20 species)
python3 fetch_birds.py
```

### Managing the Dataset

For complete documentation on adding, updating, or removing species from the dataset, see **[PIPELINE.md](PIPELINE.md)**:

- **Create**: Add new bird species to the dataset
- **Read**: Query and explore the dataset
- **Update**: Refresh data for existing species
- **Delete**: Remove species from the dataset
- **Maintenance**: Backup, verify integrity, clean up orphaned files
- **Troubleshooting**: Common issues and solutions

## Version History

- **v1.0** (2026-01-06): Initial dataset with 20 species

## Contact

For questions, issues, or contributions, please open an issue in the repository.

## Disclaimer

This dataset is intended for educational and research purposes. Please respect the original creators' licenses and attribution requirements when using this data.
