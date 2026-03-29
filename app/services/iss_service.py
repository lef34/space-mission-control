#Services handel the logic of the application.
import requests 
from app.models.iss_model import ISSLocationData, ISSPosition, AstronautsInSpace
from fastapi import HTTPException

#URLs for the Open Notify API
ISS_LOCATION_URL = "http://api.open-notify.org/iss-now.json"
ASTRONAUTS_IN_SPACE_URL ="http://api.open-notify.org/astros.json"

class ISSService:
    @staticmethod
    def get_iss_location():
        '''Fetches the current location of the ISS from the Open Notify API.'''
        response = requests.get(ISS_LOCATION_URL, timeout=10)
        data = response.json()
        try:

            iss_location_data = ISSLocationData(
                message=data["message"],
                timestamp=data["timestamp"],
                iss_position=ISSPosition(
                    latitude=float(data["iss_position"]["latitude"]),
                    longitude=float(data["iss_position"]["longitude"])
                )
            )
        except:
            raise HTTPException(status_code=500, detail="Error processing ISS location data")
        return iss_location_data
    
    def get_people_in_space():
        '''Get the number of people currently in space. Response is a dictionary containing the name of the craft and the name of the astronaut'''
        response = requests.get(ASTRONAUTS_IN_SPACE_URL, timeout=10)
        data = response.json()
        try:
            astronauts_in_space = AstronautsInSpace(
                message = data["message"],
                number = data["number"],
                people = data["people"]
            )
        except:
            raise HTTPException(status_code=500, detail="Error processing astronauts in space data")
        return astronauts_in_space