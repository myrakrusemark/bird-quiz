"""
Wikipedia API client

Handles fetching bird descriptions from Wikipedia.
Uses the Wikipedia REST API v1.
"""

from typing import Optional, Dict, Any
from urllib.parse import quote
from logger import get_logger
from modules.api_client import APIClient
from config import WIKIPEDIA_API_URL

logger = get_logger(__name__)


class WikipediaClient(APIClient):
    """Client for interacting with Wikipedia REST API"""

    def __init__(self) -> None:
        super().__init__(base_url=WIKIPEDIA_API_URL)

    def fetch_summary(self, bird_name: str) -> Optional[Dict[str, Any]]:
        """
        Fetch Wikipedia summary for a bird species.

        Args:
            bird_name: Common name of the bird (e.g., "Northern Cardinal")

        Returns:
            Dictionary with Wikipedia summary data, or None if not found
        """
        if not bird_name:
            raise ValueError("bird_name must not be empty")

        bird_name = bird_name.strip()
        encoded_name = quote(bird_name)
        url = f"{WIKIPEDIA_API_URL}/{encoded_name}"

        logger.info(f"Fetching Wikipedia summary for '{bird_name}'...")

        try:
            data = self.get_json(url)

            if "extract" in data:
                logger.info(f"Found Wikipedia summary for '{bird_name}'")
                return {
                    "title": data.get("title", bird_name),
                    "extract": data.get("extract", ""),
                    "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                }
            else:
                logger.warning(f"No summary found for '{bird_name}'")
                return None

        except Exception as e:
            logger.error(f"Error fetching Wikipedia summary for '{bird_name}': {e}")
            return None
