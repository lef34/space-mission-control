#Mission Control Project - APIs
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.iss_model import ISSLocationData, ISSPosition, AstronautsInSpace
import requests
import json
from fastapi import HTTPException
from app.services.iss_service import ISSService


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Mission Control!"}

@app.get("/iss-location", status_code=200, response_model=ISSLocationData)
def iss_location():
    try:
        iss_location_data = ISSService.get_iss_location()
    except:
        raise HTTPException(status_code=500, detail="Error fetching ISS location data")
    return iss_location_data

@app.get("/astronauts-in-space", status_code=200, response_model=AstronautsInSpace)
def astronauts_in_space():
    try:
        astronauts_in_space_data = ISSService.get_people_in_space()
    except:
        raise HTTPException(status_code=500, detail="Error fetching astronauts in space data")
    return astronauts_in_space_data