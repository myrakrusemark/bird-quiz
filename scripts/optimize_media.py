#!/usr/bin/env python3
"""
Media Optimization Script

Idempotent script that analyzes and optimizes media files:
- Photos: JPEG ≤100KB, ≤500px width
- Audio: MP3 ≤128kbps, mono

Only processes files that are out of spec.
"""

import argparse
import subprocess
import sys
import tempfile
import shutil
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

# Target specifications
MAX_PHOTO_SIZE = 100 * 1024  # 100KB in bytes
MAX_PHOTO_WIDTH = 500  # pixels
MAX_AUDIO_BITRATE = 128000  # 128kbps in bps
MAX_AUDIO_CHANNELS = 1  # mono


@dataclass
class CheckResult:
    needs_optimization: bool
    reason: Optional[str] = None


def check_photo(path: Path) -> CheckResult:
    """Check if a photo needs optimization."""
    # Check file size
    file_size = path.stat().st_size
    if file_size > MAX_PHOTO_SIZE:
        return CheckResult(True, f"size {file_size // 1024}KB > {MAX_PHOTO_SIZE // 1024}KB")

    # Check dimensions using ImageMagick identify
    try:
        result = subprocess.run(
            ["identify", "-format", "%w", str(path)],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            return CheckResult(True, "could not read dimensions")

        width = int(result.stdout.strip().split()[0])  # Handle multi-frame images
        if width > MAX_PHOTO_WIDTH:
            return CheckResult(True, f"width {width}px > {MAX_PHOTO_WIDTH}px")
    except (ValueError, subprocess.TimeoutExpired) as e:
        return CheckResult(True, f"error checking: {e}")

    return CheckResult(False)


def check_audio(path: Path) -> CheckResult:
    """Check if an audio file needs optimization."""
    try:
        result = subprocess.run([
            "ffprobe", "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=bit_rate,channels",
            "-of", "csv=p=0",
            str(path)
        ], capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            return CheckResult(True, "could not read audio info")

        output = result.stdout.strip()
        if not output:
            return CheckResult(True, "no audio stream found")

        parts = output.split(",")
        if len(parts) < 2:
            return CheckResult(True, f"unexpected format: {output}")

        bitrate_str, channels_str = parts[0], parts[1]

        # Handle "N/A" or empty values
        if bitrate_str and bitrate_str != "N/A":
            bitrate = int(bitrate_str)
            if bitrate > MAX_AUDIO_BITRATE:
                return CheckResult(True, f"bitrate {bitrate // 1000}kbps > {MAX_AUDIO_BITRATE // 1000}kbps")

        if channels_str and channels_str != "N/A":
            channels = int(channels_str)
            if channels > MAX_AUDIO_CHANNELS:
                return CheckResult(True, f"channels {channels} > {MAX_AUDIO_CHANNELS} (mono)")

    except (ValueError, subprocess.TimeoutExpired) as e:
        return CheckResult(True, f"error checking: {e}")

    return CheckResult(False)


def optimize_photo(path: Path, verbose: bool = False) -> int:
    """Optimize a photo in-place. Returns bytes saved."""
    original_size = path.stat().st_size

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        # Resize to max 500px width, quality 80%, strip metadata
        result = subprocess.run([
            "magick", str(path),
            "-resize", f"{MAX_PHOTO_WIDTH}x>",
            "-quality", "80",
            "-strip",
            str(tmp_path)
        ], capture_output=True, text=True, timeout=60)

        if result.returncode != 0:
            if verbose:
                print(f"    Error: {result.stderr}", file=sys.stderr)
            return 0

        # Replace original with optimized version
        shutil.move(str(tmp_path), str(path))
        new_size = path.stat().st_size
        return original_size - new_size

    except Exception as e:
        if verbose:
            print(f"    Error: {e}", file=sys.stderr)
        return 0
    finally:
        # Clean up temp file if it still exists
        if tmp_path.exists():
            tmp_path.unlink()


def optimize_audio(path: Path, verbose: bool = False) -> int:
    """Optimize an audio file in-place. Returns bytes saved."""
    original_size = path.stat().st_size

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        # Convert to mono, 128kbps
        result = subprocess.run([
            "ffmpeg", "-i", str(path),
            "-ac", "1",
            "-b:a", "128k",
            "-y",
            str(tmp_path)
        ], capture_output=True, text=True, timeout=120)

        if result.returncode != 0:
            if verbose:
                print(f"    Error: {result.stderr}", file=sys.stderr)
            return 0

        # Replace original with optimized version
        shutil.move(str(tmp_path), str(path))
        new_size = path.stat().st_size
        return original_size - new_size

    except Exception as e:
        if verbose:
            print(f"    Error: {e}", file=sys.stderr)
        return 0
    finally:
        # Clean up temp file if it still exists
        if tmp_path.exists():
            tmp_path.unlink()


def format_size(bytes_count: int) -> str:
    """Format bytes as human-readable size."""
    if bytes_count < 1024:
        return f"{bytes_count} B"
    elif bytes_count < 1024 * 1024:
        return f"{bytes_count / 1024:.1f} KB"
    elif bytes_count < 1024 * 1024 * 1024:
        return f"{bytes_count / (1024 * 1024):.1f} MB"
    else:
        return f"{bytes_count / (1024 * 1024 * 1024):.2f} GB"


def print_progress_bar(current: int, total: int, width: int = 40):
    """Print a progress bar."""
    if total == 0:
        return
    percent = current / total
    filled = int(width * percent)
    bar = "█" * filled + "░" * (width - filled)
    print(f"\r[{bar}] {current}/{total}", end="", flush=True)


def main():
    parser = argparse.ArgumentParser(
        description="Optimize media files for web (idempotent)"
    )
    parser.add_argument(
        "data_dir",
        type=Path,
        help="Data directory containing photos/ and audio/ subdirectories"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without doing it"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show each file being processed"
    )
    parser.add_argument(
        "--photos-only",
        action="store_true",
        help="Only process photos"
    )
    parser.add_argument(
        "--audio-only",
        action="store_true",
        help="Only process audio files"
    )

    args = parser.parse_args()

    data_dir = args.data_dir.expanduser().resolve()

    if not data_dir.exists():
        print(f"Error: Directory not found: {data_dir}", file=sys.stderr)
        sys.exit(1)

    photos_dir = data_dir / "photos"
    audio_dir = data_dir / "audio"

    process_photos = not args.audio_only
    process_audio = not args.photos_only

    photos_to_optimize = []
    audio_to_optimize = []

    # Scan photos
    if process_photos and photos_dir.exists():
        print("Scanning photos...", end=" ", flush=True)
        photo_files = list(photos_dir.glob("**/*.jpg")) + list(photos_dir.glob("**/*.jpeg"))
        print(f"{len(photo_files)} files")

        already_optimized = 0
        for photo in photo_files:
            result = check_photo(photo)
            if result.needs_optimization:
                photos_to_optimize.append((photo, result.reason))
                if args.verbose:
                    print(f"  → {photo.name}: {result.reason}")
            else:
                already_optimized += 1

        print(f"  ✓ {already_optimized} already optimized")
        print(f"  → {len(photos_to_optimize)} need optimization")

    # Scan audio
    if process_audio and audio_dir.exists():
        print("\nScanning audio...", end=" ", flush=True)
        audio_files = list(audio_dir.glob("**/*.mp3"))
        print(f"{len(audio_files)} files")

        already_optimized = 0
        for audio in audio_files:
            result = check_audio(audio)
            if result.needs_optimization:
                audio_to_optimize.append((audio, result.reason))
                if args.verbose:
                    print(f"  → {audio.name}: {result.reason}")
            else:
                already_optimized += 1

        print(f"  ✓ {already_optimized} already optimized")
        print(f"  → {len(audio_to_optimize)} need optimization")

    # Exit if dry run
    if args.dry_run:
        print("\n(Dry run - no changes made)")
        return

    total_saved = 0

    # Optimize photos
    if photos_to_optimize:
        print(f"\nOptimizing {len(photos_to_optimize)} photos...")
        for i, (photo, reason) in enumerate(photos_to_optimize):
            print_progress_bar(i, len(photos_to_optimize))
            if args.verbose:
                print(f"\n  {photo.name}", end="")
            saved = optimize_photo(photo, args.verbose)
            total_saved += saved
        print_progress_bar(len(photos_to_optimize), len(photos_to_optimize))
        print()

    # Optimize audio
    if audio_to_optimize:
        print(f"\nOptimizing {len(audio_to_optimize)} audio files...")
        for i, (audio, reason) in enumerate(audio_to_optimize):
            print_progress_bar(i, len(audio_to_optimize))
            if args.verbose:
                print(f"\n  {audio.name}", end="")
            saved = optimize_audio(audio, args.verbose)
            total_saved += saved
        print_progress_bar(len(audio_to_optimize), len(audio_to_optimize))
        print()

    # Summary
    if photos_to_optimize or audio_to_optimize:
        print(f"\nDone! Saved {format_size(total_saved)}")
    else:
        print("\nAll files already optimized!")


if __name__ == "__main__":
    main()
