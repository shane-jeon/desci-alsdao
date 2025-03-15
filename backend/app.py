from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from models.patient import Patient
import json
import traceback
import logging
from pymongo import MongoClient
from bson import json_util
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# MongoDB setup
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGODB_URI)
db = client['als-dao']
patients_collection = db['patients']
assessments_collection = db['assessments']

patient_model = Patient()

def log_request_info(route, request_obj):
    """Log detailed request information"""
    logger.debug(f"\n{'='*50}")
    logger.debug(f"[{route}] Request received at {datetime.now().isoformat()}")
    logger.debug(f"Method: {request_obj.method}")
    logger.debug(f"URL: {request_obj.url}")
    logger.debug(f"Headers: {dict(request_obj.headers)}")
    logger.debug(f"Query Params: {dict(request_obj.args)}")
    if request_obj.get_json(silent=True):
        logger.debug(f"Request Body: {json.dumps(request_obj.get_json(), indent=2)}")
    logger.debug('='*50)

def log_response_info(route, response_data, status_code=200):
    """Log detailed response information"""
    logger.debug(f"\n{'='*50}")
    logger.debug(f"[{route}] Sending response at {datetime.now().isoformat()}")
    logger.debug(f"Status Code: {status_code}")
    logger.debug(f"Response Data: {json.dumps(response_data, indent=2)}")
    logger.debug('='*50)

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

def generate_caregiver_advice(patient_profile):
    """Generate advice based on patient data"""
    advice = {
        "daily_care": [],
        "emergency_protocols": {},
        "support_resources": []
    }
    
    # Generate daily care advice
    motor_function = patient_profile.get("assessments", {}).get("motorFunction", {})
    medication_adherence = patient_profile.get("medication_adherence", {})
    speech_swallowing = patient_profile.get("speech_swallowing", {})
    
    if motor_function.get("gaitMetrics", {}).get("fallFrequency"):
        advice["daily_care"].append({
            "id": 1,
            "category": "Physical Care",
            "title": "Fall Prevention",
            "description": "High fall frequency detected. Consider physical therapy or assistive devices.",
            "importance": "High",
            "frequency": "Daily"
        })
    
    if medication_adherence.get("missed_doses", 0) > 2:
        advice["daily_care"].append({
            "id": 2,
            "category": "Medication",
            "title": "Medication Adherence",
            "description": "Set up medication reminders to avoid missed doses.",
            "importance": "High",
            "frequency": "Daily"
        })
    
    if speech_swallowing.get("swallowing_ability") == "severe":
        advice["daily_care"].append({
            "id": 3,
            "category": "Speech and Swallowing",
            "title": "Speech Therapy",
            "description": "Consider speech therapy consultation for severe swallowing difficulty.",
            "importance": "High",
            "frequency": "As recommended by therapist"
        })
    
    # Add emergency protocols
    advice["emergency_protocols"] = {
        "breathing_difficulties": {
            "symptoms": ["Rapid breathing", "Shortness of breath", "Blue-tinted lips or fingers"],
            "immediate_actions": ["Call emergency services", "Help patient into upright position", "Use prescribed breathing equipment if available"],
            "contact_numbers": ["911", "Primary Doctor: (555) 123-4567"]
        },
        "falls": {
            "assessment_steps": ["Check for consciousness", "Look for injuries", "Don't move if back/neck pain"],
            "immediate_actions": ["Call for help if needed", "Keep patient calm and still", "Apply first aid if necessary"],
            "prevention_tips": ["Keep pathways clear", "Install grab bars", "Use mobility aids"]
        }
    }
    
    # Add support resources
    advice["support_resources"] = [
        {
            "name": "ALS Association Support Group",
            "type": "Support",
            "link": "https://www.als.org/local-support",
            "contact": "(555) 789-0123",
            "schedule": "Weekly meetings on Thursdays"
        },
        {
            "name": "Caregiver Training Program",
            "type": "Education",
            "link": "https://www.alscaregiver.org/training",
            "contact": "(555) 456-7890",
            "schedule": "Monthly workshops"
        }
    ]
    
    return advice

@app.route('/patient/<user_id>', methods=['GET'])
def get_patient_data(user_id):
    try:
        patient_data = patient_model.get_patient_by_user_id(user_id)
        if not patient_data:
            return jsonify({'error': 'Patient data not found'}), 404
        
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
        
        patient_profile = create_patient_profile(omi_data, reclaim_data)
        return jsonify(patient_profile)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/patient/<user_id>', methods=['POST'])
def save_patient_data(user_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Save patient data
        existing_patient = patient_model.get_patient_by_user_id(user_id)
        if existing_patient:
            patient_model.update_patient(existing_patient['_id'], data)
        else:
            data['user_id'] = user_id
            patient_model.create_patient(data)

        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/patient/<user_id>/advice', methods=['GET'])
def get_caregiver_advice(user_id):
    try:
        patient_data = patient_model.get_patient_by_user_id(user_id)
        if not patient_data:
            return jsonify({'error': 'Patient data not found'}), 404
        
        advice = generate_caregiver_advice(patient_data)
        return jsonify(advice)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessment', methods=['POST'])
def submit_assessment():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Restructure the data to match the schema
        assessment_data = {
            'userId': user_id,
            'personal_info': {
                'name': data.get('patientName', ''),
                'dateOfBirth': data.get('dateOfBirth', ''),
                'patientAge': data.get('patientAge', ''),
                'patientGender': data.get('patientGender', ''),
            },
            'medicalHistory': {
                'diagnosisDate': data.get('diagnosisDate', ''),
                'diagnosisStage': data.get('diagnosisStage', ''),
                'comorbidities': data.get('medicalHistory', {}).get('comorbidities', ''),
                'hospitalizations': data.get('medicalHistory', {}).get('hospitalizations', ''),
                'allergies': data.get('medicalHistory', {}).get('allergies', ''),
                'familyHistory': data.get('familyHistory', ''),
                'medications': data.get('currentMedications', []),
            },
            'assessments': {
                'motor_function': {
                    'gait_metrics': {
                        'strideLength': data.get('gaitMetrics', {}).get('strideLength', ''),
                        'stepCount': data.get('gaitMetrics', {}).get('stepCount', ''),
                        'fallFrequency': data.get('gaitMetrics', {}).get('fallFrequency', ''),
                    },
                    'tremor_metrics': data.get('tremorMetrics', ''),
                    'muscle_weakness': {
                        'gripStrength': data.get('muscleWeakness', {}).get('gripStrength', ''),
                        'mobilityTest': data.get('muscleWeakness', {}).get('mobilityTest', ''),
                    },
                    'dyskinesia': data.get('dyskinesia', ''),
                    'handwriting': data.get('handwriting', ''),
                    'assistive_device': data.get('assistiveDevice', []),
                },
                'speech_swallowing': {
                    'speech_clarity': data.get('speechClarity', ''),
                    'swallowing_difficulty': data.get('swallowingDifficulty', ''),
                    'facial_control': data.get('facialControl', ''),
                },
                'respiratory': {
                    'breathing_patterns': data.get('breathingPatterns', ''),
                },
                'cognitive_behavioral': {
                    'sleep_quality': data.get('sleepQuality', ''),
                    'memory_decline': data.get('memoryDecline', ''),
                    'hallucinations': data.get('hallucinations', ''),
                },
            },
            'medication_adherence': {
                'adherence_level': data.get('medicationAdherence', ''),
                'side_effects': data.get('sideEffects', []),
            },
            'caregiver_info': {
                'primaryCaregiver': data.get('caregiverInfo', {}).get('primaryCaregiver', ''),
                'emergencyContact': data.get('caregiverInfo', {}).get('emergencyContact', ''),
            },
            'emergency_info': {
                'alert_triggers': data.get('emergencyAlertTriggers', []),
                'caregiver_stress_level': data.get('caregiverStress', ''),
            },
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
        }

        print("\n[Python Backend] Saving to MongoDB")
        try:
            # Save to MongoDB using a single collection
            result = assessments_collection.insert_one(assessment_data)
            
            print("✅ Data saved successfully")
            print(f"Assessment ID: {result.inserted_id}")
            
            return jsonify({
                'status': 'success',
                'message': 'Assessment saved successfully',
                'assessment_id': str(result.inserted_id),
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print("❌ MongoDB error:")
            print(f"Error: {str(e)}")
            print(f"Stack trace: {traceback.format_exc()}")
            return jsonify({
                'error': 'Database error',
                'details': str(e),
                'type': type(e).__name__
            }), 500

    except Exception as e:
        print("\n[Python Backend] Unhandled Error")
        print("=" * 50)
        print(f"Error: {str(e)}")
        print(f"Type: {type(e).__name__}")
        print("Stack trace:", traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'type': type(e).__name__,
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'mongodb': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/visualization', methods=['GET'])
def get_visualization_data():
    """
    Endpoint to get visualization data for the patient's metrics
    """
    try:
        log_request_info('Visualization API', request)
        
        # Get user_id from query parameters
        user_id = request.args.get('userId')
        if not user_id:
            logger.error("[Visualization API] No user_id provided")
            return jsonify({'error': 'user_id is required', 'success': False}), 400

        logger.debug(f"[Visualization API] Fetching data for user: {user_id}")
        
        # Get patient data
        patient_data = patient_model.get_patient_by_user_id(user_id)
        if not patient_data:
            logger.error(f"[Visualization API] No data found for user: {user_id}")
            return jsonify({'error': 'No data found', 'success': False}), 404

        logger.debug("[Visualization API] Processing patient data for visualization")
        
        # Extract relevant metrics for visualization
        try:
            visualization_data = {
                'metrics': {
                    'motor_function': {
                        'gait': patient_data.get('assessments', {}).get('motorFunction', {}).get('gaitMetrics', {}),
                        'muscle_weakness': patient_data.get('assessments', {}).get('motorFunction', {}).get('muscleWeakness', {})
                    },
                    'speech': patient_data.get('speech_swallowing', {}),
                    'cognitive': patient_data.get('assessments', {}).get('cognitiveHealth', {}),
                    'medication': patient_data.get('medication_adherence', {})
                },
                'timestamps': {
                    'last_updated': datetime.now().isoformat(),
                    'data_collected': patient_data.get('created_at', datetime.now()).isoformat()
                }
            }
            
            logger.debug("[Visualization API] Successfully processed visualization data")
            logger.debug(f"Visualization Data: {json.dumps(visualization_data, indent=2)}")
            
            response_data = {'data': visualization_data, 'success': True}
            log_response_info('Visualization API', response_data)
            return jsonify(response_data)
            
        except Exception as e:
            logger.error(f"[Visualization API] Error processing data: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return jsonify({
                'error': 'Failed to convert data to frontend format',
                'details': str(e),
                'success': False
            }), 500

    except Exception as e:
        logger.error(f"[Visualization API] Unexpected error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'success': False
        }), 500

@app.route('/api/frequency-analysis', methods=['GET'])
def get_frequency_analysis():
    """
    Endpoint to get frequency analysis of patient's data points
    """
    try:
        log_request_info('Frequency Analysis API', request)
        
        # Get user_id from query parameters
        user_id = request.args.get('userId')
        if not user_id:
            logger.error("[Frequency Analysis API] No user_id provided")
            return jsonify({'error': 'user_id is required', 'success': False}), 400

        logger.debug(f"[Frequency Analysis API] Fetching data for user: {user_id}")
        
        # Get patient data
        patient_data = patient_model.get_patient_by_user_id(user_id)
        if not patient_data:
            logger.error(f"[Frequency Analysis API] No data found for user: {user_id}")
            return jsonify({'error': 'No data found', 'success': False}), 404

        logger.debug("[Frequency Analysis API] Processing patient data for frequency analysis")
        
        try:
            # Extract and analyze frequency data
            frequency_data = {
                'symptom_frequency': {
                    'falls': patient_data.get('assessments', {}).get('motorFunction', {}).get('gaitMetrics', {}).get('fallFrequency', 0),
                    'medication_missed': patient_data.get('medication_adherence', {}).get('missed_doses', 0),
                    'side_effects': len(patient_data.get('medication_adherence', {}).get('side_effects', [])),
                    'emergency_triggers': len(patient_data.get('emergencyAlertTriggers', []))
                },
                'temporal_analysis': {
                    'assessment_dates': {
                        'last_motor_assessment': patient_data.get('assessments', {}).get('motorFunction', {}).get('last_assessment'),
                        'last_speech_assessment': patient_data.get('speech_swallowing', {}).get('last_assessment'),
                        'last_cognitive_assessment': patient_data.get('assessments', {}).get('cognitiveHealth', {}).get('last_assessment')
                    }
                },
                'metadata': {
                    'analysis_timestamp': datetime.now().isoformat(),
                    'data_period': 'last 30 days'  # This could be made dynamic
                }
            }
            
            logger.debug("[Frequency Analysis API] Successfully processed frequency data")
            logger.debug(f"Frequency Data: {json.dumps(frequency_data, indent=2)}")
            
            response_data = {'data': frequency_data, 'success': True}
            log_response_info('Frequency Analysis API', response_data)
            return jsonify(response_data)
            
        except Exception as e:
            logger.error(f"[Frequency Analysis API] Error processing data: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return jsonify({
                'error': 'Failed to convert data to frontend format',
                'details': str(e),
                'success': False
            }), 500

    except Exception as e:
        logger.error(f"[Frequency Analysis API] Unexpected error: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 