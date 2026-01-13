"""
File downloader module

Handles downloading and validating media files (photos, audio, spectrograms).
"""

from pathlib import Path
from typing import Optional
from logger import get_logger
from modules.api_client import APIClient
from utils.validators import validate_image_file, validate_file_size

logger = get_logger(__name__)


class Downloader:
    """Handles downloading and validating media files"""

    def __init__(self) -> None:
        self.client = APIClient()

    def download_photo(
        self,
        url: str,
        filepath: Path,
        validate: bool = True,
        min_size: int = 50000,
        max_size: int = 52428800  # 50MB
    ) -> bool:
        """
        Download and validate a photo.

        Args:
            url: URL to download from
            filepath: Where to save the file
            validate: Whether to validate the file after download
            min_size: Minimum file size in bytes
            max_size: Maximum file size in bytes

        Returns:
            True if download and validation successful, False otherwise
        """
        try:
            # Download file
            success = self.client.download_file(url, filepath)

            if not success:
                return False

            # Validate if requested
            if validate:
                # Check file size
                if not validate_file_size(filepath, min_size=min_size, max_size=max_size):
                    logger.warning(f"Photo failed size validation: {filepath}")
                    filepath.unlink()
                    return False

                # Check file type
                if not validate_image_file(filepath):
                    logger.warning(f"Photo failed type validation: {filepath}")
                    filepath.unlink()
                    return False

            return True

        except Exception as e:
            logger.error(f"Error downloading photo from {url}: {e}")
            if filepath.exists():
                filepath.unlink()
            return False

    def download_audio(
        self,
        url: str,
        filepath: Path,
        min_size: int = 1000  # 1KB minimum
    ) -> bool:
        """
        Download and validate an audio file.

        Args:
            url: URL to download from
            filepath: Where to save the file
            min_size: Minimum file size in bytes

        Returns:
            True if download successful, False otherwise
        """
        try:
            # Download file
            success = self.client.download_file(url, filepath)

            if not success:
                return False

            # Basic size validation
            if not validate_file_size(filepath, min_size=min_size):
                logger.warning(f"Audio file too small: {filepath}")
                filepath.unlink()
                return False

            return True

        except Exception as e:
            logger.error(f"Error downloading audio from {url}: {e}")
            if filepath.exists():
                filepath.unlink()
            return False

    def download_spectrogram(
        self,
        url: str,
        filepath: Path,
        validate: bool = True
    ) -> bool:
        """
        Download and validate a spectrogram image.

        Args:
            url: URL to download from
            filepath: Where to save the file
            validate: Whether to validate the file after download

        Returns:
            True if download successful, False otherwise
        """
        try:
            # Download file
            success = self.client.download_file(url, filepath)

            if not success:
                return False

            # Validate if requested
            if validate:
                if not validate_image_file(filepath):
                    logger.warning(f"Spectrogram failed validation: {filepath}")
                    filepath.unlink()
                    return False

            return True

        except Exception as e:
            logger.error(f"Error downloading spectrogram from {url}: {e}")
            if filepath.exists():
                filepath.unlink()
            return False
