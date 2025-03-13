from datetime import datetime
from models.patient import Patient

patient_model = Patient()

def fetch_patient_data(user_id):
    """Fetch patient data from MongoDB"""
    try:
        patient_data = patient_model.get_patient_by_user_id(user_id)
        if not patient_data:
            return None, None
        
        # Transform data to match expected format
        omi_data = {
            "demographics": patient_data.get("demographics", {}),
            "medical_history": patient_data.get("medicalHistory", {}),
            "medication_adherence": patient_data.get("medication_adherence", {})
        }
        
        reclaim_data = {
            "motor_function": patient_data.get("assessments", {}).get("motorFunction", {}),
            "speech_swallowing": patient_data.get("speech_swallowing", {}),
            "respiratory_sleep": {
                "breathing_rate": 16,  # Default values for now
                "oxygen_saturation": patient_data.get("oxygenSaturation", 97),
                "sleep_quality": patient_data.get("sleepQuality", "7h 50m")
            },
            "cognitive_health": patient_data.get("assessments", {}).get("cognitiveHealth", {})
        }
        
        return omi_data, reclaim_data
    except Exception as e:
        print(f"Error fetching patient data: {str(e)}")
        return None, None

def create_patient_profile(omi_data, reclaim_data):
    """Create a unified patient profile"""
    profile = {
        "personal_info": omi_data.get("demographics", {}).get("personal_info", {}),
        "demographics": omi_data.get("demographics", {}),
        "medicalHistory": omi_data.get("medical_history", {}),
        "assessments": {
            "motorFunction": reclaim_data.get("motor_function", {}),
            "cognitiveHealth": reclaim_data.get("cognitive_health", {})
        },
        "speech_swallowing": reclaim_data.get("speech_swallowing", {}),
        "medication_adherence": omi_data.get("medication_adherence", {}),
        "sleepQuality": reclaim_data.get("respiratory_sleep", {}).get("sleep_quality"),
        "last_updated": datetime.now().isoformat()
    }
    return profile

def save_patient_data(user_id, data):
    """Save patient data to MongoDB"""
    try:
        existing_patient = patient_model.get_patient_by_user_id(user_id)
        if existing_patient:
            patient_model.update_patient(existing_patient['_id'], data)
        else:
            data['user_id'] = user_id
            patient_model.create_patient(data)
        return True
    except Exception as e:
        print(f"Error saving patient data: {str(e)}")
        return False

def generate_caregiver_advice(patient_profile):
    """Generate advice based on patient data"""
    advice = []
    
    motor_function = patient_profile.get("assessments", {}).get("motorFunction", {})
    medication_adherence = patient_profile.get("medication_adherence", {})
    speech_swallowing = patient_profile.get("speech_swallowing", {})
    
    # Check for motor function issues
    if motor_function.get("gaitMetrics", {}).get("fallFrequency"):
        advice.append("High fall frequency detected. Consider physical therapy or assistive devices.")
    
    # Check for medication adherence
    if medication_adherence.get("missed_doses", 0) > 2:
        advice.append("Missed doses detected. Set up medication reminders.")
    
    # Check for speech and swallowing issues
    if speech_swallowing.get("swallowing_ability") == "severe":
        advice.append("Severe swallowing difficulty detected. Consider speech therapy consultation.")
    
    return advice

def send_alert(caregiver_contact, message):
    """Send alert to caregiver"""
    # TODO: Implement actual alert sending mechanism
    print(f"Alert sent to {caregiver_contact}: {message}")
    return True

# Example usage
if __name__ == "__main__":
    patient_id = "12345"
    omi_data, reclaim_data = fetch_patient_data(patient_id)
    patient_profile = create_patient_profile(omi_data, reclaim_data)
    caregiver_advice = generate_caregiver_advice(patient_profile)

    print("Patient Profile:", patient_profile)
    print("Caregiver Advice:", caregiver_advice)

    # Example alert for significant changes
    if patient_profile["assessments"]["motorFunction"].get("gaitMetrics", {}).get("fallFrequency", 0) > 5:
        send_alert(patient_profile["demographics"].get("emergency_contact"), "High fall frequency detected!")