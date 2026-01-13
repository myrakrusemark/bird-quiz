"""
Cache module with SQLite backend

Provides caching for API responses and progress tracking for resumable collections.
"""

import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, Set
from logger import get_logger

logger = get_logger(__name__)


class Cache:
    """SQLite-based cache for API responses and progress tracking"""

    def __init__(self, cache_dir: Path, cache_expiry_days: int = 7):
        """
        Initialize cache.

        Args:
            cache_dir: Directory for cache files
            cache_expiry_days: Number of days before cache entries expire
        """
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        self.db_path = cache_dir / "api_cache.db"
        self.progress_file = cache_dir / "progress.json"
        self.cache_expiry_days = cache_expiry_days

        self._init_db()

    def _init_db(self) -> None:
        """Initialize SQLite database schema"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS api_cache (
                    key TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL
                )
            """)

            # Create index for faster expiry cleanup
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_expires_at
                ON api_cache(expires_at)
            """)

            conn.commit()
            logger.debug(f"Cache database initialized at {self.db_path}")

    def get(self, key: str) -> Optional[Any]:
        """
        Get cached data by key.

        Args:
            key: Cache key

        Returns:
            Cached data if found and not expired, None otherwise
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "SELECT data, expires_at FROM api_cache WHERE key = ?",
                    (key,)
                )
                row = cursor.fetchone()

                if not row:
                    logger.debug(f"Cache miss: {key}")
                    return None

                data_json, expires_at = row

                # Check expiry
                expires_at_dt = datetime.fromisoformat(expires_at)
                if datetime.now() > expires_at_dt:
                    logger.debug(f"Cache expired: {key}")
                    self.delete(key)
                    return None

                logger.debug(f"Cache hit: {key}")
                return json.loads(data_json)

        except Exception as e:
            logger.error(f"Error reading from cache: {e}")
            return None

    def set(self, key: str, data: Any, expiry_days: Optional[int] = None) -> None:
        """
        Store data in cache.

        Args:
            key: Cache key
            data: Data to cache (must be JSON-serializable)
            expiry_days: Days until expiry (defaults to cache_expiry_days)
        """
        try:
            expiry_days = expiry_days or self.cache_expiry_days
            expires_at = datetime.now() + timedelta(days=expiry_days)

            data_json = json.dumps(data)

            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO api_cache (key, data, expires_at)
                    VALUES (?, ?, ?)
                    """,
                    (key, data_json, expires_at.isoformat())
                )
                conn.commit()
                logger.debug(f"Cached: {key} (expires: {expires_at.strftime('%Y-%m-%d %H:%M')})")

        except Exception as e:
            logger.error(f"Error writing to cache: {e}")

    def delete(self, key: str) -> None:
        """Delete cache entry by key"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("DELETE FROM api_cache WHERE key = ?", (key,))
                conn.commit()
                logger.debug(f"Deleted from cache: {key}")
        except Exception as e:
            logger.error(f"Error deleting from cache: {e}")

    def cleanup_expired(self) -> None:
        """Remove all expired cache entries"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    "DELETE FROM api_cache WHERE expires_at < ?",
                    (datetime.now().isoformat(),)
                )
                deleted = cursor.rowcount
                conn.commit()

                if deleted > 0:
                    logger.info(f"Cleaned up {deleted} expired cache entries")

        except Exception as e:
            logger.error(f"Error cleaning up cache: {e}")

    def clear_all(self) -> None:
        """Clear all cache entries"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("DELETE FROM api_cache")
                conn.commit()
                logger.info("Cleared all cache entries")
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")

    def save_progress(self, species_id: str, species_data: Dict[str, Any]) -> None:
        """
        Save progress for a completed species.

        Args:
            species_id: ID of the species
            species_data: Complete species data dictionary
        """
        try:
            # Load existing progress
            progress = self.load_progress()

            # Add/update this species
            progress['completed_species'][species_id] = {
                'data': species_data,
                'completed_at': datetime.now().isoformat()
            }
            progress['last_updated'] = datetime.now().isoformat()

            # Save progress file
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(progress, f, indent=2, ensure_ascii=False)

            logger.debug(f"Saved progress for {species_id}")

        except Exception as e:
            logger.error(f"Error saving progress: {e}")

    def load_progress(self) -> Dict[str, Any]:
        """
        Load collection progress.

        Returns:
            Dictionary with progress data
        """
        try:
            if self.progress_file.exists():
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    progress = json.load(f)
                    logger.debug(f"Loaded progress: {len(progress.get('completed_species', {}))} species completed")
                    return progress
        except Exception as e:
            logger.error(f"Error loading progress: {e}")

        # Return empty progress structure
        return {
            'completed_species': {},
            'started_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat()
        }

    def get_completed_species_ids(self) -> Set[str]:
        """
        Get set of species IDs that have been completed.

        Returns:
            Set of completed species IDs
        """
        progress = self.load_progress()
        return set(progress.get('completed_species', {}).keys())

    def clear_progress(self) -> None:
        """Clear progress file to start fresh"""
        try:
            if self.progress_file.exists():
                self.progress_file.unlink()
                logger.info("Cleared progress file")
        except Exception as e:
            logger.error(f"Error clearing progress: {e}")
