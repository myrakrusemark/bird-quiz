"""
Wikimedia Commons API client

Handles fetching bird photos from Wikimedia Commons.
Uses the MediaWiki API.
"""

import time
from typing import List, Dict, Optional, Any
from urllib.parse import quote
from logger import get_logger
from modules.api_client import APIClient
from config import MAX_PHOTOS_PER_SPECIES

logger = get_logger(__name__)

# Wikimedia Commons API endpoint
WIKIMEDIA_API_URL = "https://commons.wikimedia.org/w/api.php"

# Keywords to skip (icons, maps, diagrams, etc.)
SKIP_IMAGE_KEYWORDS = [
    "icon", "logo", "map", "range", "distribution",
    "diagram", "chart", "illustration.svg"
]


class WikimediaClient(APIClient):
    """Client for interacting with Wikimedia Commons API"""

    def __init__(self) -> None:
        super().__init__(base_url=WIKIMEDIA_API_URL)

    def fetch_photos(
        self,
        search_query: str,
        fallback_query: Optional[str] = None,
        limit: int = MAX_PHOTOS_PER_SPECIES,
        min_size: int = 50000
    ) -> List[Dict[str, Any]]:
        """
        Fetch photos from Wikimedia Commons for a bird species.

        Args:
            search_query: Primary search query (e.g., "Cardinalis cardinalis")
            fallback_query: Fallback search if primary fails (e.g., "Northern Cardinal")
            limit: Maximum number of photos to fetch
            min_size: Minimum file size in bytes (to filter out icons)

        Returns:
            List of photo metadata dictionaries
        """
        if not search_query:
            raise ValueError("search_query must not be empty")

        logger.info(f"Fetching photos from Wikimedia Commons for '{search_query}'...")

        # Try primary search
        photos = self._search_photos(search_query, limit, min_size)

        # Fallback to common name if scientific name yields no results
        if not photos and fallback_query and fallback_query != search_query:
            logger.info(f"No photos found, trying fallback query '{fallback_query}'...")
            photos = self._search_photos(fallback_query, limit, min_size)

        logger.info(f"Found {len(photos)} photos for '{search_query}'")
        return photos[:limit]

    def _search_photos(
        self,
        query: str,
        limit: int,
        min_size: int
    ) -> List[Dict[str, Any]]:
        """
        Internal method to search for photos.

        Args:
            query: Search query
            limit: Maximum number of photos
            min_size: Minimum file size

        Returns:
            List of photo metadata
        """
        params = {
            "action": "query",
            "format": "json",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": "6",  # File namespace
            "gsrlimit": limit * 3,  # Fetch more for aggressive filtering
            "prop": "imageinfo",
            "iiprop": "url|size|mime|extmetadata",
            "iiurlwidth": "1024"
        }

        try:
            data = self.get_json(WIKIMEDIA_API_URL, params=params)

            if "query" not in data or "pages" not in data["query"]:
                logger.debug(f"No results found for query '{query}'")
                return []

            pages = data["query"]["pages"]
            photos = []

            for page_id, page_data in pages.items():
                if "imageinfo" not in page_data:
                    continue

                image_info = page_data["imageinfo"][0]
                title = page_data.get("title", "").lower()

                # Skip non-photo files
                if not image_info.get("mime", "").startswith("image/"):
                    continue

                # Skip small files (likely icons)
                if image_info.get("size", 0) < min_size:
                    continue

                # Skip files with excluded keywords in title
                if any(keyword in title for keyword in SKIP_IMAGE_KEYWORDS):
                    logger.debug(f"Skipping {title} (matches skip keyword)")
                    continue

                # Extract metadata
                ext_metadata = image_info.get("extmetadata", {})

                photo = {
                    "url": image_info.get("url", ""),
                    "thumburl": image_info.get("thumburl", image_info.get("url", "")),
                    "size": image_info.get("size", 0),
                    "width": image_info.get("width", 0),
                    "height": image_info.get("height", 0),
                    "license": ext_metadata.get("LicenseShortName", {}).get("value", "Unknown"),
                    "attribution": ext_metadata.get("Artist", {}).get("value", "Unknown"),
                    "title": page_data.get("title", ""),
                }

                photos.append(photo)

            return photos

        except Exception as e:
            logger.error(f"Error searching Wikimedia Commons for '{query}': {e}")
            return []

    def add_rate_limit_delay(self, delay: float = 1.5) -> None:
        """
        Add delay to avoid rate limiting from Wikimedia Commons.

        Args:
            delay: Delay in seconds
        """
        time.sleep(delay)
