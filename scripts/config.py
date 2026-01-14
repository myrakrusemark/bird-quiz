"""
Configuration for bird dataset collection scripts
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(Path(__file__).parent / '.env')

# Xeno-canto API configuration
XENO_CANTO_API_KEY = os.getenv('XENO_CANTO_API_KEY')
if not XENO_CANTO_API_KEY:
    print("ERROR: XENO_CANTO_API_KEY not found in environment variables.")
    print("Please create a .env file in the scripts/ directory with your API key.")
    print("See .env.example for the required format.")
    print("\nGet your free API key at: https://xeno-canto.org/api/guide")
    sys.exit(1)

XENO_CANTO_API_URL = "https://xeno-canto.org/api/3/recordings"

# Wikipedia API configuration
WIKIPEDIA_API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary"

# Directory paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
PHOTOS_DIR = DATA_DIR / "photos"
AUDIO_DIR = DATA_DIR / "audio"
LOGS_DIR = DATA_DIR / "logs"
CACHE_DIR = DATA_DIR / ".cache"
DATASET_FILE = DATA_DIR / "birds.json"


# Collection settings
QUALITY_FILTER = ["A", "B", "no score"]  # Accept A, B, and unrated recordings
MAX_RECORDINGS_PER_SPECIES = 15  # Maximum number of recordings to collect per species
MIN_RECORDINGS_PER_SPECIES = 3   # Minimum to consider the species complete
MAX_PHOTOS_PER_SPECIES = 10      # Maximum number of photos per species
MIN_PHOTOS_PER_SPECIES = 3       # Minimum to consider complete

# Download settings
REQUEST_TIMEOUT = 30  # Seconds
MAX_RETRIES = 2       # Number of retry attempts (reduced to avoid hammering rate limits)
RETRY_DELAY = 5.0     # Base delay in seconds (will use exponential backoff: 5s, 10s)
WIKIMEDIA_RATE_LIMIT_DELAY = 5.0  # Delay between Wikimedia photo downloads to avoid 429 errors
WIKIMEDIA_RETRY_DELAY = 10.0  # Longer delay for Wikimedia retries after failures

# User agent for API requests
USER_AGENT = "BirdDatasetCollector/1.0 (Educational project; myra)"

# Logging configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')  # Can be overridden via environment variable

# Cache configuration
CACHE_EXPIRY_DAYS = 7  # Number of days before cached API responses expire
