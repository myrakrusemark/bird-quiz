"""
Xeno-canto API client

Handles fetching bird recordings from the Xeno-canto database.
https://xeno-canto.org/api/guide
"""

from typing import List, Dict, Any
from logger import get_logger
from modules.api_client import APIClient
from config import (
    XENO_CANTO_API_KEY,
    XENO_CANTO_API_URL,
    QUALITY_FILTER,
    MAX_RECORDINGS_PER_SPECIES
)

logger = get_logger(__name__)


class XenoCantoClient(APIClient):
    """Client for interacting with Xeno-canto API"""

    def __init__(self) -> None:
        super().__init__(base_url=XENO_CANTO_API_URL)

    def fetch_recordings(
        self,
        genus: str,
        species: str,
        limit: int = MAX_RECORDINGS_PER_SPECIES
    ) -> List[Dict[str, Any]]:
        """
        Fetch audio recordings for a bird species from Xeno-canto.

        Args:
            genus: Bird genus (e.g., "Cardinalis")
            species: Bird species (e.g., "cardinalis")
            limit: Maximum number of recordings to fetch

        Returns:
            List of recording metadata dictionaries
        """
        if not genus or not species:
            raise ValueError("genus and species must not be empty")

        if limit <= 0:
            raise ValueError(f"limit must be positive, got {limit}")

        query = f"gen:{genus.strip()} sp:{species.strip()}"
        params = {
            "query": query,
            "key": XENO_CANTO_API_KEY,
            "per_page": limit
        }

        logger.info(f"Fetching recordings from Xeno-canto for {genus} {species}...")

        try:
            data = self.get_json(XENO_CANTO_API_URL, params=params)

            if "recordings" in data:
                recordings = data["recordings"]

                # Filter by quality if specified
                if QUALITY_FILTER:
                    recordings = [r for r in recordings if r.get("q") in QUALITY_FILTER]

                logger.info(f"Found {len(recordings)} recordings (quality filtered)")
                return recordings[:limit]
            else:
                logger.warning(f"No recordings found in response for {genus} {species}")
                logger.debug(f"Response keys: {list(data.keys())}")
                return []

        except Exception as e:
            logger.error(f"Error fetching recordings for {genus} {species}: {e}")
            return []
