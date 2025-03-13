import requests
import json
from models.patient import Patient
from datetime import datetime

BASE_URL = "http://localhost:5000"

def print_section(title):
    print(f"\n{'='*20} {title} {'='*20}")

def test_frontend_data_flow():
    print_section("Testing Frontend Data Flow")
    
    # 1. First, create test data in MongoDB
    print("\n1. Creating test data in MongoDB...")
    test_user_id = "test_frontend_user_123"
    current_time = datetime.now()
    
    test_data = {
        "user_id": test_user_id,
        "personal_info": {
            "name": "Test Patient",
            "dateOfBirth": "1990-01-01",
            "patientAge": "33",
            "patientGender": "male"
        },
        "demographics": {
            "age": 33,
            "gender": "male",
            "location": ""
        },
        "medicalHistory": {
            "diagnosisDate": "2023-01-01",
            "diagnosisStage": "2",
            "familyHistory": "No family history of ALS",
            "medications": ["Riluzole", "Edaravone"],
            "comorbidities": "Hypertension",
            "hospitalizations": "None",
            "allergies": "Penicillin"
        },
        "assessments": {
            "motorFunction": {
                "gaitMetrics": {
                    "strideLength": "50",
                    "stepCount": "1000",
                    "fallFrequency": "2"
                },
                "tremorMetrics": "mild",
                "muscleWeakness": {
                    "gripStrength": "moderate",
                    "mobilityTest": "independent"
                }
            },
            "cognitiveHealth": {
                "memoryDecline": "none",
                "hallucinations": "none"
            }
        },
        "speech_swallowing": {
            "speech_clarity": "mild impairment",
            "swallowing_ability": "moderate",
            "facialControl": "good",
            "last_assessment": current_time.isoformat()
        },
        "medication_adherence": {
            "current_medications": ["Riluzole", "Edaravone"],
            "side_effects": ["Fatigue", "Nausea"],
            "missed_doses": 0,
            "medicationAdherence": "high"
        },
        "caregiverInfo": {
            "primaryCaregiver": "Jane Doe",
            "emergencyContact": "123-456-7890",
            "caregiverStress": "moderate"
        },
        "assistiveDevices": ["walker"],
        "sleepQuality": "fair",
        "emergencyAlertTriggers": ["Falls", "Breathing Difficulty"],
        "created_at": current_time,
        "updated_at": current_time
    }

    try:
        patient_model = Patient()
        patient_model.collection.insert_one(test_data)
        print("✅ Test data created in MongoDB")
    except Exception as e:
        print(f"❌ Failed to create test data: {str(e)}")
        return False

    # 2. Test the backend API endpoint
    print("\n2. Testing backend API endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/patient/{test_user_id}")
        
        if response.status_code == 200:
            print("✅ Backend API endpoint successful")
            data = response.json()
            print("\nReceived data structure:")
            print(json.dumps(data, indent=2))
        else:
            print(f"❌ Backend API endpoint failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Backend API endpoint failed with error: {str(e)}")
        return False

    # 3. Verify data structure matches frontend expectations
    print("\n3. Verifying data structure...")
    required_fields = [
        "personal_info",
        "demographics",
        "medicalHistory",
        "assessments",
        "speech_swallowing",
        "medication_adherence",
        "sleepQuality"
    ]

    try:
        data = response.json()
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        
        print("✅ All required fields present")
        
        # Verify specific field structures
        verification_points = [
            ('demographics.age', isinstance(data.get('demographics', {}).get('age'), (int, type(None)))),
            ('speech_swallowing.speech_clarity', isinstance(data.get('speech_swallowing', {}).get('speech_clarity'), str)),
            ('medication_adherence.current_medications', isinstance(data.get('medication_adherence', {}).get('current_medications'), list)),
            ('assessments.motorFunction.gaitMetrics', isinstance(data.get('assessments', {}).get('motorFunction', {}).get('gaitMetrics'), dict))
        ]

        all_verified = True
        for field, result in verification_points:
            if result:
                print(f"✅ {field}: Verified")
            else:
                print(f"❌ {field}: Verification failed")
                all_verified = False

        if all_verified:
            print("\n✅ All data structures verified successfully")
        else:
            print("\n❌ Some data structures failed verification")
            return False

    except Exception as e:
        print(f"❌ Data structure verification failed with error: {str(e)}")
        return False

    # 4. Cleanup
    print("\n4. Cleaning up test data...")
    try:
        patient_model.collection.delete_one({'user_id': test_user_id})
        print("✅ Test data cleaned up")
    except Exception as e:
        print(f"❌ Cleanup failed with error: {str(e)}")
        return False

    return True

if __name__ == "__main__":
    print_section("Starting Frontend Data Flow Test")
    print("This test will:")
    print("1. Create test data in MongoDB")
    print("2. Test the backend API endpoint")
    print("3. Verify data structure matches frontend expectations")
    print("4. Clean up test data")
    
    success = test_frontend_data_flow()
    
    print_section("Test Results")
    if success:
        print("✅ All tests passed successfully")
    else:
        print("❌ Tests failed") 