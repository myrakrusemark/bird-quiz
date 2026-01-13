"""
Retry logic with exponential backoff

Provides a decorator for retrying operations that may fail transiently,
such as network requests.
"""

import time
import functools
from typing import Callable, TypeVar, Any
from logger import get_logger

F = TypeVar('F', bound=Callable[..., Any])

logger = get_logger(__name__)


def retry_with_backoff(max_retries: int = 3, base_delay: float = 2.0) -> Callable[[F], F]:
    """
    Decorator that retries a function with exponential backoff on failure.

    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds (doubles each retry)
        exceptions: Tuple of exception types to catch

    Usage:
        @retry_with_backoff(max_retries=3, base_delay=2)
        def my_function():
            ...
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            last_exception = None

            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        logger.debug(f"{func.__name__} failed (attempt {attempt + 1}/{max_retries}), retrying in {delay}s...")
                        time.sleep(delay)
                    else:
                        logger.error(f"{func.__name__} failed after {max_retries} attempts")

            # If we get here, all retries failed
            if last_exception:
                raise last_exception
            return None  # Should never reach here

        return wrapper  # type: ignore[return-value]
    return decorator
