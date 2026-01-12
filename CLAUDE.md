# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multi-modal bird identification quiz application** combining:
- **React + TypeScript frontend** with Vite build system
- **Python data collection pipeline** that aggregates bird data from Xeno-canto (audio) and Wikipedia (photos/descriptions)
- **20 common North American birds** with photos, audio recordings, spectrograms, and metadata
- **localStorage-based progress tracking** with rolling accuracy statistics

The app runs entirely client-side with no backend, using a static JSON dataset with cached media files.

## Quick Start

To start the bird quiz server:

```bash
cd /home/myra/bird-dataset/web
npm run dev
```

The app will be available at **http://localhost:5173/**

## Common Development Commands

### Frontend (React App)

```bash
# Navigate to web directory
cd web/

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to web/dist/)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Data Collection Pipeline (Python)

```bash
# Navigate to scripts directory
cd scripts/

# Test with first 3 species only
python3 fetch_birds.py --test

# Collect all 20 species (overwrites data/birds.json)
python3 fetch_birds.py
```

**Important**: See [PIPELINE.md](PIPELINE.md) for complete CRUD documentation on managing the dataset.

## Architecture Overview

### Data Flow

```
birds.json (20 species dataset)
    ↓
useBirdData hook (loads & caches in memory)
    ↓
App.tsx (orchestrates all state)
    ├→ useQuiz (question state machine)
    │   └→ questionGenerator (creates multi-modal questions)
    ├→ useProgress (tracks answers in localStorage)
    └→ useQuizSettings (manages enabled question/answer types)
    ↓
QuestionCard component (renders media + options)
```

### Question Generation System

The `questionGenerator.ts` utility implements a complex multi-modal question system:

**5 Question Types:**
- `photo-to-name`: Show photo → identify bird name
- `audio-to-name`: Play sound → identify bird name
- `photo-audio-to-name`: Show photo + audio simultaneously
- `name-to-media`: Show name → identify correct media
- `mixed`: Random combination of above

**4 Answer Formats:**
- `text`: Text-only answers (bird names)
- `photo`: Photo-only answers (visual matching)
- `audio`: Audio-only answers (sound matching)
- `mixed`: Random mix of all modalities

**Critical Logic:**
- **Media Exclusion**: Prevents same media appearing in both question and answer options
- **Retry Mechanism**: Up to 10 attempts to generate valid questions based on enabled settings
- **Graceful Degradation**: If insufficient media (e.g., only 1 photo available), automatically downgrades to simpler question types

### Progress Tracking (Dual System)

Two independent tracking systems stored in localStorage:

1. **Overall Stats** (`useProgress.ts`):
   - Total accuracy across all attempts
   - Per-species statistics (identifies birds user struggles with)
   - Current and max streaks

2. **Rolling Stats** ("Endless Journey Mode"):
   - Circular buffer of last 20 answers
   - Rolling accuracy percentage
   - Designed for long quiz sessions without overwhelming the user

### Audio Playback Architecture

`QuestionCard.tsx` manages multiple concurrent audio instances:
- Tracks question audio + 4 option audio players simultaneously
- Implements cleanup on unmount and question change to prevent memory leaks
- Separate play state for each option to prevent overlapping playback

### File Structure

```
bird-dataset/
├── data/
│   ├── birds.json                 # Main dataset (20 species with metadata)
│   ├── photos/                    # Cached bird photographs
│   ├── audio/                     # Cached MP3 recordings
│   └── spectrograms/              # Spectrogram PNG images
│
├── scripts/                       # Python data collection pipeline
│   ├── fetch_birds.py            # Main collection script
│   ├── config.py                 # API keys and collection settings
│   └── species_list.py           # 20 bird species definitions
│
└── web/                          # React frontend application
    ├── src/
    │   ├── main.tsx              # React entry point
    │   ├── App.tsx               # Root component (orchestrates quiz)
    │   │
    │   ├── types/
    │   │   └── bird.ts           # Core TypeScript interfaces
    │   │
    │   ├── hooks/                # Custom React hooks
    │   │   ├── useBirdData.ts    # Dataset loading & caching
    │   │   ├── useQuiz.ts        # Quiz state machine
    │   │   ├── useProgress.ts    # Progress tracking & localStorage
    │   │   └── useQuizSettings.ts # Quiz configuration
    │   │
    │   ├── components/           # React UI components
    │   │   ├── QuestionCard.tsx  # Main question display
    │   │   ├── ProgressBar.tsx   # Stats header
    │   │   ├── AccuracyGraph.tsx # Sparkline visualization
    │   │   └── QuizSettings.tsx  # Settings modal
    │   │
    │   └── utils/               # Utility functions
    │       ├── dataLoader.ts    # JSON loading & media URLs
    │       ├── questionGenerator.ts # Question creation logic
    │       └── scoring.ts       # Accuracy calculations
    │
    └── vite.config.ts           # Vite configuration
```

## Key Configuration Details

### Vite Configuration

**File**: `web/vite.config.ts`

Critical setting: `server.fs.allow: ['..']`
- Allows serving files from parent directory (`../data/`)
- Required for dev server to access dataset and media files
- Path alias: `@` → `src/` for clean imports

### Data Collection Configuration

**File**: `scripts/config.py`

Key settings:
- `QUALITY_FILTER = ["A", "B", "no score"]` - Only accepts high-quality recordings
- `MAX_RECORDINGS_PER_SPECIES = 15` - Limits recordings per bird
- `REQUEST_TIMEOUT = 30` - API request timeout in seconds
- `MAX_RETRIES = 3` - Retry attempts for failed downloads

**API Key**: Xeno-canto API key stored in `config.py` (line 8)

### TypeScript Configuration

**Path Alias**: `@` maps to `src/` directory
- Example: `import { Bird } from '@/types/bird'`

## Important Implementation Details

### Dataset Loading and Caching

**File**: `web/src/utils/dataLoader.ts`

- Single `cachedData` variable prevents repeated fetches of the ~100MB+ dataset
- All media file paths are relative to the public directory
- File naming: `{species-id}-{type}{recording-id}.{ext}`

### localStorage Data Migration

**File**: `web/src/hooks/useProgress.ts`

- Auto-migrates old progress format to new format on load
- Maintains backwards compatibility with previous versions

### Question Settings Validation

**File**: `web/src/hooks/useQuizSettings.ts`

- UI prevents disabling last enabled question type or answer format
- Must have at least one option selected to generate questions

## Current Development State

**Active Branch**: `game-style-ui`

Recent features:
- Game-style UI with translucent backdrops and background image
- Endless journey mode with rolling 20-question accuracy tracking
- Enhanced quiz settings with multiple question/answer modalities
- Audio playback bug fixes

## Data Sources and Attribution

- **Audio & Spectrograms**: Xeno-canto (xeno-canto.org) - CC BY-NC-SA licensed
- **Photos & Descriptions**: Wikimedia Commons & Wikipedia - CC BY-SA licensed
- All media includes attribution metadata (recordist, date, location, license)
- App displays recording metadata to respect Creative Commons requirements

## Development Notes

- **No backend required**: Entire app runs client-side
- **No test framework**: No Jest, Vitest, or similar configured
- **No build step for data**: Python pipeline outputs static JSON; web app consumes it directly
- **Parent directory access**: Dev server explicitly allows serving `../data/` directory
