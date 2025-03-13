import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_health_check():
    print("\n1. Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check successful")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")

def test_assessment_submission():
    print("\n2. Testing Assessment Submission...")
    
    # Test data
    test_user_id = "test_api_user_123"
    test_assessment_data = {
        "userId": test_user_id,
        "patientName": "API Test Patient",
        "dateOfBirth": "1990-01-01",
        "patientAge": "33",
        "patientGender": "female",
        "diagnosisDate": "2023-01-01",
        "diagnosisStage": "2",
        "medicalHistory": {
            "comorbidities": "None",
            "hospitalizations": "None",
            "allergies": "None"
        },
        "currentMedications": ["Test Med 1", "Test Med 2"],
        "familyHistory": "No family history",
        "caregiverInfo": {
            "primaryCaregiver": "Test Caregiver",
            "emergencyContact": "123-456-7890"
        },
        "gaitMetrics": {
            "strideLength": "50",
            "stepCount": "1000",
            "fallFrequency": "0"
        },
        "tremorMetrics": "mild",
        "muscleWeakness": {
            "gripStrength": "moderate",
            "mobilityTest": "independent"
        },
        "speechClarity": "normal",
        "swallowingDifficulty": "none",
        "sleepQuality": "good"
    }

    try:
        # Submit assessment
        print("\nSubmitting assessment data...")
        response = requests.post(
            f"{BASE_URL}/api/assessment",
            json=test_assessment_data
        )
        
        if response.status_code == 200:
            print("✅ Assessment submission successful")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Assessment submission failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            return
    except Exception as e:
        print(f"❌ Assessment submission failed: {str(e)}")
        return

    # Verify data was saved
    print("\nVerifying saved data...")
    try:
        response = requests.get(f"{BASE_URL}/patient/{test_user_id}")
        if response.status_code == 200:
            patient_data = response.json()
            print("✅ Data verification successful")
            print(f"Retrieved data: {json.dumps(patient_data, indent=2)}")
            
            # Verify key fields
            assert patient_data['personal_info']['name'] == "API Test Patient"
            assert patient_data['demographics']['gender'] == "female"
            print("✅ Data validation successful")
        else:
            print(f"❌ Data verification failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Data verification failed: {str(e)}")

    # Test caregiver advice
    print("\nTesting caregiver advice endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/patient/{test_user_id}/advice")
        if response.status_code == 200:
            advice_data = response.json()
            print("✅ Caregiver advice retrieval successful")
            print(f"Advice data: {json.dumps(advice_data, indent=2)}")
        else:
            print(f"❌ Caregiver advice retrieval failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Caregiver advice retrieval failed: {str(e)}")

if __name__ == "__main__":
    test_health_check()
    test_assessment_submission() 