from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from als import fetch_patient_data, create_patient_profile, generate_caregiver_advice
from typing import Dict, Any

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/patient/{user_id}")
async def get_patient_data(user_id: str) -> Dict[str, Any]:
    try:
        omi_data, reclaim_data = fetch_patient_data(user_id)
        patient_profile = create_patient_profile(omi_data, reclaim_data)
        return patient_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patient/{user_id}")
async def store_patient_data(user_id: str, data: Dict[str, Any]) -> Dict[str, str]:
    try:
        # In a real implementation, you would store this data
        # For now, we'll just return success
        return {"message": "Data stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/caregiver-advice/{user_id}")
async def get_caregiver_advice(user_id: str) -> Dict[str, Any]:
    try:
        omi_data, reclaim_data = fetch_patient_data(user_id)
        patient_profile = create_patient_profile(omi_data, reclaim_data)
        advice = generate_caregiver_advice(patient_profile)
        return {"advice": advice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 