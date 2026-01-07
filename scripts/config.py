"""
Configuration for bird dataset collection scripts
"""

from pathlib import Path

# Xeno-canto API configuration
XENO_CANTO_API_KEY = "b7a325791722c2402bb0935f8966913472fb0147"
XENO_CANTO_API_URL = "https://xeno-canto.org/api/3/recordings"

# Wikipedia API configuration
WIKIPEDIA_API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary"

# Directory paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
PHOTOS_DIR = DATA_DIR / "photos"
AUDIO_DIR = DATA_DIR / "audio"
SPECTROGRAMS_DIR = DATA_DIR / "spectrograms"
DATASET_FILE = DATA_DIR / "birds.json"

# Collection settings
QUALITY_FILTER = ["A", "B", "no score"]  # Accept A, B, and unrated recordings
MAX_RECORDINGS_PER_SPECIES = 15  # Maximum number of recordings to collect per species
MIN_RECORDINGS_PER_SPECIES = 3   # Minimum to consider the species complete
MAX_PHOTOS_PER_SPECIES = 10      # Maximum number of photos per species
MIN_PHOTOS_PER_SPECIES = 3       # Minimum to consider complete

# Download settings
REQUEST_TIMEOUT = 30  # Seconds
MAX_RETRIES = 3       # Number of retry attempts for failed requests
RETRY_DELAY = 2       # Base delay in seconds (will use exponential backoff)

# User agent for API requests
USER_AGENT = "BirdDatasetCollector/1.0 (Educational project; myra)"
