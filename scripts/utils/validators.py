"""
File validation utilities

Provides functions for validating downloaded media files.
"""

import subprocess
from pathlib import Path
from typing import Optional
from logger import get_logger

logger = get_logger(__name__)


def validate_image_file(filepath: Path, timeout: int = 5) -> bool:
    """
    Validate that a file is actually an image using the 'file' command.

    Uses the system 'file' command to check MIME type. A file is considered
    valid if it returns an 'image/*' MIME type.

    Args:
        filepath: Path to the file to validate. File must exist and be readable.
        timeout: Timeout in seconds for the validation check.

    Returns:
        True if file MIME type is 'image/*', False if invalid or error occurs.
        Note: Returns False on any error (missing file, permission denied, timeout).
    """
    try:
        result = subprocess.run(
            ['file', '--mime-type', str(filepath)],
            capture_output=True,
            text=True,
            timeout=timeout
        )

        if result.returncode == 0:
            mime_type = result.stdout.strip().split(':')[-1].strip()
            return mime_type.startswith('image/')

        return False

    except subprocess.TimeoutExpired:
        logger.warning(f"File validation timed out for {filepath}")
        return False
    except FileNotFoundError:
        logger.error(f"'file' command not found - cannot validate {filepath}")
        return False
    except Exception as e:
        logger.warning(f"Unexpected validation error for {filepath}: {e}")
        return False


def validate_file_size(filepath: Path, min_size: int = 0, max_size: Optional[int] = None) -> bool:
    """
    Validate file size is within acceptable bounds.

    Args:
        filepath: Path to the file to validate
        min_size: Minimum file size in bytes (default: 0)
        max_size: Maximum file size in bytes (default: None = no limit)

    Returns:
        True if file size is within bounds, False otherwise
    """
    try:
        if not filepath.exists():
            logger.warning(f"File does not exist: {filepath}")
            return False

        size = filepath.stat().st_size

        if size < min_size:
            logger.debug(f"File too small ({size} bytes < {min_size} bytes): {filepath}")
            return False

        if max_size is not None and size > max_size:
            logger.debug(f"File too large ({size} bytes > {max_size} bytes): {filepath}")
            return False

        return True

    except Exception as e:
        logger.error(f"Error checking file size for {filepath}: {e}")
        return False
