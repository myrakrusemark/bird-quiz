"""
iNaturalist API client

Handles fetching bird photos from iNaturalist.
https://api.inaturalist.org/v1/docs/
"""

from typing import List, Dict, Optional, Any
from logger import get_logger
from modules.api_client import APIClient
from config import MAX_PHOTOS_PER_SPECIES

logger = get_logger(__name__)

# iNaturalist API endpoint
INATURALIST_API_URL = "https://api.inaturalist.org/v1"


class iNaturalistClient(APIClient):
    """Client for interacting with iNaturalist API"""

    def __init__(self) -> None:
        super().__init__(base_url=INATURALIST_API_URL)

    def fetch_photos(
        self,
        scientific_name: str,
        common_name: Optional[str] = None,
        limit: int = MAX_PHOTOS_PER_SPECIES,
        quality_grade: str = "research"
    ) -> List[Dict[str, Any]]:
        """
        Fetch photos from iNaturalist for a bird species.

        Args:
            scientific_name: Scientific name (e.g., "Cardinalis cardinalis")
            common_name: Common name for logging (e.g., "Northern Cardinal")
            limit: Maximum number of photos to fetch
            quality_grade: Quality filter - "research" (verified), "needs_id", or "any"

        Returns:
            List of photo metadata dictionaries
        """
        if not scientific_name:
            raise ValueError("scientific_name must not be empty")

        logger.info(f"Fetching photos from iNaturalist for '{scientific_name}'...")

        # First, search for the taxon ID
        taxon_id = self._get_taxon_id(scientific_name)
        if not taxon_id:
            logger.warning(f"Could not find taxon ID for '{scientific_name}'")
            return []

        # Then fetch observations with photos
        photos = self._fetch_observations_photos(
            taxon_id=taxon_id,
            limit=limit,
            quality_grade=quality_grade
        )

        logger.info(f"Found {len(photos)} photos for '{scientific_name}'")
        return photos[:limit]

    def _get_taxon_id(self, scientific_name: str) -> Optional[int]:
        """
        Get the iNaturalist taxon ID for a species.

        Args:
            scientific_name: Scientific name to search for

        Returns:
            Taxon ID if found, None otherwise
        """
        try:
            params = {
                "q": scientific_name,
                "rank": "species",
                "is_active": "true"
            }

            data = self.get_json(f"{INATURALIST_API_URL}/taxa", params=params)

            if "results" in data and len(data["results"]) > 0:
                # Get the first (best) match
                taxon = data["results"][0]
                taxon_id = taxon.get("id")
                logger.debug(f"Found taxon ID {taxon_id} for '{scientific_name}'")
                return taxon_id

            return None

        except Exception as e:
            logger.error(f"Error fetching taxon ID for '{scientific_name}': {e}")
            return None

    def _fetch_observations_photos(
        self,
        taxon_id: int,
        limit: int,
        quality_grade: str = "research"
    ) -> List[Dict[str, Any]]:
        """
        Fetch observation photos for a taxon.

        Args:
            taxon_id: iNaturalist taxon ID
            limit: Maximum number of photos
            quality_grade: Quality filter

        Returns:
            List of photo metadata
        """
        try:
            params = {
                "taxon_id": taxon_id,
                "quality_grade": quality_grade,
                "has[]": "photos",  # Only observations with photos
                "order": "desc",
                "order_by": "votes",  # Most popular/highest quality first
                "per_page": min(limit * 2, 50),  # Fetch extra for filtering
                "locale": "en"
            }

            data = self.get_json(f"{INATURALIST_API_URL}/observations", params=params)

            if "results" not in data:
                logger.debug("No results found in iNaturalist response")
                return []

            photos = []
            seen_urls = set()  # Avoid duplicates

            for observation in data["results"]:
                if len(photos) >= limit:
                    break

                # Get photos from this observation
                obs_photos = observation.get("photos", [])
                if not obs_photos:
                    continue

                # Use the first (best) photo from each observation
                photo = obs_photos[0]
                photo_url = photo.get("url")

                if not photo_url or photo_url in seen_urls:
                    continue

                seen_urls.add(photo_url)

                # Get medium or large size
                photo_url = photo_url.replace("square", "medium")

                # Extract attribution info
                observer = observation.get("user", {})
                observer_name = observer.get("name") or observer.get("login", "Unknown")
                observation_url = f"https://www.inaturalist.org/observations/{observation.get('id', '')}"

                photos.append({
                    "url": photo_url,
                    "thumburl": photo.get("url", photo_url),
                    "license": photo.get("license_code", "all-rights-reserved"),
                    "attribution": observer_name,
                    "observation_url": observation_url,
                    "observation_id": observation.get("id"),
                    "quality_grade": observation.get("quality_grade", "unknown")
                })

            return photos

        except Exception as e:
            logger.error(f"Error fetching observations for taxon {taxon_id}: {e}")
            return []
