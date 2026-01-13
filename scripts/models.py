"""
Pydantic models for data validation

Provides type-safe data structures with runtime validation for bird dataset.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator


class SpeciesInfo(BaseModel):
    """Species metadata for data collection"""
    id: str = Field(..., min_length=1, description="Unique species identifier")
    commonName: str = Field(..., min_length=1, description="Common name of the species")
    scientificName: str = Field(..., min_length=1, description="Scientific name (Latin)")
    genus: str = Field(..., min_length=1, description="Genus name")
    species: str = Field(..., min_length=1, description="Species name")
    region: str = Field(default="North America", description="Geographic region")

    @field_validator('id', 'commonName', 'scientificName', 'genus', 'species')
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        """Ensure strings are not empty or whitespace-only"""
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class PhotoData(BaseModel):
    """Photo metadata from Wikimedia Commons"""
    url: HttpUrl = Field(..., description="Direct URL to photo")
    source: str = Field(default="Wikimedia Commons", description="Source attribution")
    license: str = Field(..., description="License type (e.g., CC BY-SA)")
    attribution: str = Field(..., description="Photo attribution text")
    cached: Optional[str] = Field(default=None, description="Local cached file path")


class RecordingData(BaseModel):
    """Audio recording metadata from Xeno-canto"""
    id: str = Field(..., description="Xeno-canto recording ID")
    type: str = Field(..., description="Recording type (call, song, etc.)")
    audioUrl: HttpUrl = Field(..., description="URL to MP3 file")
    spectrogramUrl: Optional[str] = Field(default=None, description="URL to spectrogram image")
    quality: str = Field(..., description="Quality rating (A, B, C, D, E, or 'no score')")
    duration: str = Field(..., description="Recording duration")
    location: str = Field(..., description="Recording location")
    recordist: str = Field(..., description="Name of recordist")
    date: str = Field(..., description="Recording date")
    license: str = Field(..., description="License type")
    cachedAudio: Optional[str] = Field(default=None, description="Local cached audio path")
    cachedSpectrogram: Optional[str] = Field(default=None, description="Local cached spectrogram path")


class SpeciesStats(BaseModel):
    """Statistics for collected species data"""
    totalRecordings: int = Field(ge=0, description="Total number of recordings")
    recordingTypes: List[str] = Field(default_factory=list, description="List of recording types")
    totalPhotos: int = Field(ge=0, description="Total number of photos")


class SpeciesData(BaseModel):
    """Complete species data including media and metadata"""
    id: str = Field(..., description="Species identifier")
    commonName: str = Field(..., description="Common name")
    scientificName: str = Field(..., description="Scientific name")
    region: str = Field(..., description="Geographic region")
    description: str = Field(default="", description="Wikipedia summary")
    photos: List[PhotoData] = Field(default_factory=list, description="List of photos")
    recordings: List[RecordingData] = Field(default_factory=list, description="List of recordings")
    stats: SpeciesStats = Field(..., description="Collection statistics")


class DatasetMetadata(BaseModel):
    """Dataset metadata"""
    version: str = Field(..., description="Dataset version")
    created: str = Field(..., description="Creation date (YYYY-MM-DD)")
    totalSpecies: int = Field(ge=0, description="Total number of species")
    dataSources: List[str] = Field(..., description="List of data sources")
    testMode: bool = Field(default=False, description="Whether dataset was created in test mode")


class Dataset(BaseModel):
    """Complete bird dataset structure"""
    species: List[SpeciesData] = Field(..., description="List of species data")
    metadata: DatasetMetadata = Field(..., description="Dataset metadata")

    @field_validator('species')
    @classmethod
    def validate_species_not_empty(cls, v: List[SpeciesData]) -> List[SpeciesData]:
        """Ensure at least one species is present"""
        if not v:
            raise ValueError("Dataset must contain at least one species")
        return v
