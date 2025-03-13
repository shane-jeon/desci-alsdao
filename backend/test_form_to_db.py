import requests
import json
from models.patient import Patient
from datetime import datetime

BASE_URL = "http://localhost:5000"

def print_section(title):
    print(f"\n{'='*20} {title} {'='*20}")

def test_form_submission():
    print_section("Testing Patient Assessment Form Submission")
    
    # Test form data that matches the frontend form structure
    test_form_data = {
        "userId": "test_form_user_123",
        "patientName": "John Doe",
        "dateOfBirth": "1990-01-01",
        "patientAge": "33",
        "patientGender": "male",
        "diagnosisDate": "2023-01-01",
        "diagnosisStage": "2",
        "medicalHistory": {
            "comorbidities": "Hypertension",
            "hospitalizations": "None",
            "allergies": "Penicillin"
        },
        "currentMedications": ["Riluzole", "Edaravone"],
        "familyHistory": "No family history of ALS",
        "caregiverInfo": {
            "primaryCaregiver": "Jane Doe",
            "emergencyContact": "123-456-7890"
        },
        "gaitMetrics": {
            "strideLength": "50",
            "stepCount": "1000",
            "fallFrequency": "2"
        },
        "tremorMetrics": "mild",
        "muscleWeakness": {
            "gripStrength": "moderate",
            "mobilityTest": "independent"
        },
        "speechClarity": "mild impairment",
        "swallowingDifficulty": "moderate",
        "facialControl": "good",
        "breathingPatterns": "normal",
        "sleepQuality": "fair",
        "memoryDecline": "none",
        "hallucinations": "none",
        "medicationAdherence": "high",
        "sideEffects": ["Fatigue", "Nausea"],
        "assistiveDevice": ["walker"],
        "emergencyAlertTriggers": ["Falls", "Breathing Difficulty"],
        "caregiverStress": "moderate"
    }

    # 1. Submit form data to API
    print("\n1. Submitting form data to API...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/assessment",
            json=test_form_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("✅ Form submission successful")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Form submission failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Form submission failed with error: {str(e)}")
        return False

    # 2. Verify data in MongoDB
    print("\n2. Verifying data in MongoDB...")
    try:
        patient_model = Patient()
        saved_data = patient_model.get_patient_by_user_id(test_form_data["userId"])
        
        if not saved_data:
            print("❌ Data not found in MongoDB")
            return False

        print("✅ Data found in MongoDB")
        print("\nSaved data:")
        print(json.dumps(saved_data, default=str, indent=2))

        # 3. Verify key fields
        print("\n3. Verifying key fields...")
        verification_points = [
            ('personal_info.name', saved_data.get('personal_info', {}).get('name') == test_form_data['patientName']),
            ('speech_swallowing.speech_clarity', saved_data.get('speech_swallowing', {}).get('speech_clarity') == test_form_data['speechClarity']),
            ('medication_adherence.current_medications', set(saved_data.get('medication_adherence', {}).get('current_medications', [])) == set(test_form_data['currentMedications'])),
            ('assessments.motorFunction.gaitMetrics', saved_data.get('assessments', {}).get('motorFunction', {}).get('gaitMetrics', {}).get('fallFrequency') == test_form_data['gaitMetrics']['fallFrequency'])
        ]

        all_verified = True
        for field, result in verification_points:
            if result:
                print(f"✅ {field}: Verified")
            else:
                print(f"❌ {field}: Verification failed")
                all_verified = False

        if all_verified:
            print("\n✅ All key fields verified successfully")
        else:
            print("\n❌ Some fields failed verification")

        # 4. Cleanup
        print("\n4. Cleaning up test data...")
        patient_model.collection.delete_one({'user_id': test_form_data['userId']})
        print("✅ Test data cleaned up")

        return all_verified

    except Exception as e:
        print(f"❌ Verification failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    print_section("Starting Test")
    print("This test will:")
    print("1. Submit a test patient assessment form")
    print("2. Verify the data is saved in MongoDB")
    print("3. Verify key fields are correctly stored")
    print("4. Clean up test data")
    
    success = test_form_submission()
    
    print_section("Test Results")
    if success:
        print("✅ All tests passed successfully")
    else:
        print("❌ Tests failed") 