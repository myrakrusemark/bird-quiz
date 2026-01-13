"""
Logging configuration for bird dataset collection scripts

Provides structured logging with:
- Multiple log levels (DEBUG, INFO, WARNING, ERROR)
- Console and file output
- Timestamps and severity labels
- Rotating log files to prevent disk space issues
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from typing import Optional


def setup_logger(
    name: str = __name__,
    log_level: str = "INFO",
    log_dir: Optional[Path] = None,
    console_output: bool = True
) -> logging.Logger:
    """
    Setup and configure a logger instance

    Args:
        name: Logger name (typically __name__ from calling module)
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        log_dir: Directory for log files (defaults to ../data/logs)
        console_output: Whether to output to console (default True)

    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger(name)

    # Convert log level string to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(numeric_level)

    # Prevent duplicate handlers if logger already configured
    if logger.handlers:
        return logger

    # Create formatters
    detailed_formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    simple_formatter = logging.Formatter(
        fmt='%(levelname)s: %(message)s'
    )

    # Console handler
    if console_output:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(numeric_level)
        # Use simple format for console, detailed for file
        console_handler.setFormatter(simple_formatter)
        logger.addHandler(console_handler)

    # File handler (rotating to prevent huge log files)
    if log_dir is None:
        log_dir = Path(__file__).parent.parent / 'data' / 'logs'

    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'bird_collection.log'

    # Rotate when file reaches 10MB, keep 5 backup files
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)  # Always log DEBUG to file
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)

    return logger


def get_logger(name: str = __name__) -> logging.Logger:
    """
    Get or create a logger instance

    This is a convenience function that returns an already-configured logger
    if it exists, or creates a new one with default settings.

    Args:
        name: Logger name (typically __name__ from calling module)

    Returns:
        Logger instance
    """
    logger = logging.getLogger(name)

    # If not configured, setup with defaults
    if not logger.handlers:
        return setup_logger(name)

    return logger
