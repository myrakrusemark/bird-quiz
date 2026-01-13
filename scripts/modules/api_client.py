"""
Shared API client with retry logic

Provides common HTTP request functionality with automatic retries,
error handling, and logging.
"""

import requests
from typing import Dict, Optional, Any
from logger import get_logger
from utils.retry import retry_with_backoff
from config import REQUEST_TIMEOUT, MAX_RETRIES, RETRY_DELAY, USER_AGENT

logger = get_logger(__name__)


class APIClient:
    """Base API client with retry logic and error handling"""

    def __init__(self, base_url: str = "", default_headers: Optional[Dict[str, str]] = None):
        """
        Initialize API client.

        Args:
            base_url: Base URL for API requests (optional)
            default_headers: Default headers to include in all requests
        """
        self.base_url = base_url
        self.default_headers = default_headers or {}

        # Always include User-Agent
        if 'User-Agent' not in self.default_headers:
            self.default_headers['User-Agent'] = USER_AGENT

    @staticmethod
    def normalize_url(url: str) -> str:
        """
        Normalize URL by adding scheme if missing.

        Args:
            url: URL that may be missing scheme

        Returns:
            URL with proper scheme
        """
        if url.startswith('//'):
            return f'https:{url}'
        return url

    @retry_with_backoff(max_retries=MAX_RETRIES, base_delay=RETRY_DELAY)
    def get(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: int = REQUEST_TIMEOUT
    ) -> requests.Response:
        """
        Perform GET request with retry logic.

        Args:
            url: URL to request (will be joined with base_url if relative)
            params: Query parameters
            headers: Additional headers (merged with default headers)
            timeout: Request timeout in seconds

        Returns:
            Response object

        Raises:
            requests.exceptions.RequestException: On request failure after all retries
        """
        # Normalize URL (handle protocol-relative URLs)
        url = self.normalize_url(url)

        # Build full URL
        if not url.startswith('http'):
            url = f"{self.base_url.rstrip('/')}/{url.lstrip('/')}"

        # Merge headers
        request_headers = {**self.default_headers, **(headers or {})}

        logger.debug(f"GET {url} (params: {params})")

        response = requests.get(
            url,
            params=params,
            headers=request_headers,
            timeout=timeout
        )
        response.raise_for_status()

        return response

    def get_json(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: int = REQUEST_TIMEOUT
    ) -> Dict[str, Any]:
        """
        Perform GET request and return JSON response.

        Args:
            url: URL to request
            params: Query parameters
            headers: Additional headers
            timeout: Request timeout in seconds

        Returns:
            Parsed JSON response as dictionary

        Raises:
            requests.exceptions.RequestException: On request failure
            ValueError: On JSON decode error
        """
        response = self.get(url, params=params, headers=headers, timeout=timeout)
        return response.json()

    @retry_with_backoff(max_retries=MAX_RETRIES, base_delay=RETRY_DELAY)
    def download_file(
        self,
        url: str,
        filepath: Any,  # Path
        chunk_size: int = 8192,
        timeout: int = REQUEST_TIMEOUT
    ) -> bool:
        """
        Download file with streaming and retry logic.

        Args:
            url: URL to download from
            filepath: Path where file should be saved
            chunk_size: Download chunk size in bytes
            timeout: Request timeout in seconds

        Returns:
            True if download successful, False otherwise
        """
        from pathlib import Path

        filepath = Path(filepath)

        # Normalize URL (handle protocol-relative URLs)
        url = self.normalize_url(url)

        logger.debug(f"Downloading {url} to {filepath}")

        response = requests.get(url, stream=True, headers=self.default_headers, timeout=timeout)
        response.raise_for_status()

        # Get expected file size if available
        expected_size = int(response.headers.get('content-length', 0))

        # Download file
        downloaded = 0
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)

        # Verify file was created and has content
        if not filepath.exists():
            logger.error(f"File was not created: {filepath}")
            return False

        actual_size = filepath.stat().st_size

        if actual_size == 0:
            logger.error(f"Downloaded file is empty: {filepath}")
            filepath.unlink()
            return False

        # Verify size matches if Content-Length was provided
        if expected_size > 0 and actual_size != expected_size:
            logger.warning(
                f"File size mismatch for {filepath}: "
                f"expected {expected_size} bytes, got {actual_size} bytes"
            )
            # Don't fail on size mismatch, just warn
            # Some servers don't report accurate Content-Length

        logger.debug(f"Successfully downloaded {filepath} ({actual_size} bytes)")
        return True
