# This file defines the data models for mission control application.
from pydantic import BaseModel

class ISSPosition(BaseModel):
    latitude: float
    longitude: float

class ISSLocationData(BaseModel):
    message: str
    timestamp: int
    iss_position: ISSPosition

class AstronautsInSpace(BaseModel):
    message: str
    number: int
    people: list[dict[str, str]]