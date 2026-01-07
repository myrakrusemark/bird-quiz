# Bird Learning Web Application

A multi-modal learning application for identifying common North American backyard birds through photos, audio recordings, and spectrograms.

## Features

### Four Learning Modes

1. **Photo → Name** 📸
   - View a bird photo and identify the species from 4 multiple choice options
   - Great for visual learners

2. **Audio → Name** 🎵
   - Listen to a bird call and identify the species
   - Trains your ear to recognize different bird songs and calls

3. **Spectrogram → Name** 📊
   - View a spectrogram (visual representation of sound) and identify the species
   - Learn to recognize sound patterns visually

4. **Mixed Challenge** 🎯
   - Multi-modal questions that mix different presentation styles
   - Advanced challenge for expert learners

### Progress Tracking

- **Persistent Progress**: All progress is saved to browser localStorage
- **Per-Mode Stats**: Track accuracy for each learning mode separately
- **Overall Statistics**: View your overall performance across all modes
- **Streak Bonuses**: Build streaks of correct answers for bonus points

### Scoring System

- **Correct Answer**: +10 points
- **First Try Bonus**: +5 points
- **Streak Bonus**: +2 points per consecutive correct (max +10)
- **Performance Levels**: Track your skill level from Novice to Expert

## Dataset

- **20 Species**: Common North American backyard birds
- **300 Recordings**: 15 recordings per species from Xeno-canto
- **300 Spectrograms**: Generated spectrograms for each recording
- **20 Photos**: High-quality photos from Wikipedia

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The app runs on `http://localhost:5173/` by default.

## Project Structure

```
web/
├── src/
│   ├── components/          # React components
│   │   ├── ModeSelector.tsx # Learning mode selection screen
│   │   ├── QuestionCard.tsx # Question display with media
│   │   └── ProgressBar.tsx  # Quiz progress indicator
│   ├── hooks/               # Custom React hooks
│   │   ├── useBirdData.ts   # Load bird data
│   │   ├── useProgress.ts   # Progress tracking
│   │   └── useQuiz.ts       # Quiz state management
│   ├── utils/               # Utility functions
│   │   ├── dataLoader.ts    # Data loading utilities
│   │   ├── questionGenerator.ts # Question generation
│   │   └── scoring.ts       # Scoring logic
│   ├── types/               # TypeScript type definitions
│   │   └── bird.ts          # Bird data types
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/
│   └── data/                # Symlink to ../../data/
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## How It Works

### Data Loading

- On quiz start, 10 random birds are loaded from the dataset
- Media files (photos, audio, spectrograms) are loaded on-demand
- Efficient caching prevents re-downloading the same files

### Question Generation

Questions are randomly generated based on the selected mode:

- **Photo questions**: Show a random photo, ask for bird name
- **Audio questions**: Play a random recording, ask for bird name
- **Spectrogram questions**: Show a random spectrogram, ask for bird name
- **Mixed questions**: Randomly combine different modalities

### Progress Persistence

All progress is stored in browser localStorage:

```javascript
{
  "overallStats": {
    "totalQuestions": 150,
    "correct": 120,
    "accuracy": 80,
    "lastPlayed": "2026-01-06T17:46:00Z"
  },
  "modeStats": {
    "photo": { "correct": 40, "total": 50, "accuracy": 80 },
    "audio": { "correct": 35, "total": 50, "accuracy": 70 },
    "spectrogram": { "correct": 25, "total": 30, "accuracy": 83 },
    "mixed": { "correct": 20, "total": 20, "accuracy": 100 }
  },
  "speciesStats": {
    "northern-cardinal": { "correct": 8, "total": 10, "accuracy": 80 }
  }
}
```

## Technologies

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **localStorage**: Browser-based persistence

## Attribution

This application uses data from:

- **Xeno-canto.org**: Bird recordings and spectrograms (CC BY-NC-SA 4.0)
- **Wikipedia**: Bird photos and descriptions (various Creative Commons licenses)

All media files include proper attribution and licensing information displayed during quiz sessions.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

Requires JavaScript enabled and localStorage support.

## Future Enhancements

Possible future features:

- User accounts and cloud sync
- Custom quiz lengths (5, 10, 20 questions)
- Difficulty levels (beginner, intermediate, expert)
- Region-based filtering
- Additional bird species
- Offline mode (PWA)
- Social features and leaderboards

## License

This application is for educational and non-commercial use only, in accordance with the Creative Commons licenses of the source data.

## Support

For issues or questions, please refer to the main project documentation in `/home/myra/bird-dataset/`.
