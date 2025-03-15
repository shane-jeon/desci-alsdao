from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from models.patient import Patient
import json
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

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
        print("\n[Python Backend] Assessment Submission Received")
        print("=" * 50)
        print(f"Timestamp: {datetime.now().isoformat()}")
        
        # Log request details
        print("\n[Python Backend] Request Details:")
        print("- Method:", request.method)
        print("- URL:", request.url)
        print("- Headers:", dict(request.headers))
        print("- Content Type:", request.content_type)
        print("- Content Length:", request.content_length)
        
        # Get and validate request data
        data = request.get_json()
        print("\n[Python Backend] Request Data:")
        print("- Raw Data:", data)
        
        if not data:
            print("[Python Backend] Error: No data provided")
            return jsonify({'error': 'No data provided'}), 400

        user_id = data.get('userId')
        if not user_id:
            print("[Python Backend] Error: No user ID provided")
            return jsonify({'error': 'User ID is required'}), 400

        print(f"\n[Python Backend] Processing data for user: {user_id}")

        # Validate required fields
        required_fields = [
            'patientName', 'patientAge', 'patientGender', 'diagnosisDate',
            'diagnosisStage', 'medicalHistory', 'currentMedications',
            'familyHistory', 'caregiverInfo', 'gaitMetrics', 'tremorMetrics',
            'muscleWeakness', 'dyskinesia', 'handwriting', 'assistiveDevice',
            'speechClarity', 'swallowingDifficulty', 'facialControl',
            'breathingPatterns', 'sleepQuality', 'memoryDecline',
            'hallucinations', 'medicationAdherence', 'sideEffects',
            'emergencyAlertTriggers', 'caregiverStress'
        ]

        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            print("\n[Python Backend] Validation Error:")
            print("- Missing required fields:", missing_fields)
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Transform the assessment data
        print("\n[Python Backend] Transforming Data")
        patient_data = {
            'user_id': user_id,
            'personal_info': {
                'name': data.get('patientName', ''),
                'dateOfBirth': data.get('dateOfBirth', ''),
                'patientAge': data.get('patientAge', ''),
                'patientGender': data.get('patientGender', '')
            },
            'demographics': {
                'age': int(data.get('patientAge', 0)) if data.get('patientAge', '').isdigit() else 0,
                'gender': data.get('patientGender', ''),
                'location': data.get('location', '')
            },
            'medicalHistory': {
                'diagnosisDate': data.get('diagnosisDate', ''),
                'diagnosisStage': data.get('diagnosisStage', ''),
                'familyHistory': data.get('familyHistory', ''),
                'medications': data.get('currentMedications', []),
                'comorbidities': data.get('medicalHistory', {}).get('comorbidities', ''),
                'hospitalizations': data.get('medicalHistory', {}).get('hospitalizations', ''),
                'allergies': data.get('medicalHistory', {}).get('allergies', '')
            },
            'assessments': {
                'speech': {
                    'score': 0,
                    'notes': data.get('speechClarity', '')
                },
                'mobility': {
                    'score': 0,
                    'notes': f"Gait: {data.get('gaitMetrics', {}).get('strideLength', '')}, Steps: {data.get('gaitMetrics', {}).get('stepCount', '')}, Falls: {data.get('gaitMetrics', {}).get('fallFrequency', '')}"
                },
                'breathing': {
                    'score': 0,
                    'notes': data.get('breathingPatterns', '')
                }
            },
            'caregiverInfo': {
                'primaryCaregiver': data.get('caregiverInfo', {}).get('primaryCaregiver', ''),
                'emergencyContact': data.get('caregiverInfo', {}).get('emergencyContact', ''),
                'relationship': data.get('caregiverInfo', {}).get('relationship', '')
            },
            'additionalAssessments': {
                'tremorMetrics': data.get('tremorMetrics', ''),
                'muscleWeakness': data.get('muscleWeakness', {}),
                'dyskinesia': data.get('dyskinesia', ''),
                'handwriting': data.get('handwriting', ''),
                'assistiveDevice': data.get('assistiveDevice', []),
                'swallowingDifficulty': data.get('swallowingDifficulty', ''),
                'facialControl': data.get('facialControl', ''),
                'sleepQuality': data.get('sleepQuality', ''),
                'memoryDecline': data.get('memoryDecline', ''),
                'hallucinations': data.get('hallucinations', ''),
                'medicationAdherence': data.get('medicationAdherence', ''),
                'sideEffects': data.get('sideEffects', []),
                'emergencyAlertTriggers': data.get('emergencyAlertTriggers', []),
                'caregiverStress': data.get('caregiverStress', '')
            }
        }

        print("\n[Python Backend] Transformed Data:")
        print("- Patient Data:", json.dumps(patient_data, indent=2))

        # Validate against schema
        print("\n[Python Backend] Schema Validation")
        try:
            from models.patient import patient_schema
            from bson import json_util
            import jsonschema
            
            json_schema = patient_schema['validator']['$jsonSchema']
            jsonschema.validate(instance=patient_data, schema=json_schema)
            print("- Schema validation successful")
        except jsonschema.exceptions.ValidationError as e:
            print("- Schema validation failed:")
            print(f"  - Error: {str(e)}")
            print(f"  - Path: {' -> '.join(str(p) for p in e.path)}")
            print(f"  - Instance: {e.instance}")
            return jsonify({
                'error': 'Data validation failed',
                'details': str(e),
                'path': list(e.path),
                'instance': e.instance
            }), 400

        # Save to MongoDB
        print("\n[Python Backend] MongoDB Operation")
        try:
            result = patient_model.save_patient_data(user_id, patient_data)
            print("- Save result:", result)
            if not result:
                print("- Error: Failed to save patient data")
                return jsonify({'error': 'Failed to save patient data'}), 500
            print("- Data saved successfully")
        except Exception as e:
            print("- MongoDB error:")
            print(f"  - Error: {str(e)}")
            print(f"  - Type: {type(e).__name__}")
            print(f"  - Stack trace:", traceback.format_exc())
            return jsonify({
                'error': 'Database error',
                'details': str(e),
                'type': type(e).__name__
            }), 500

        print("\n[Python Backend] Success")
        print("=" * 50)
        return jsonify({
            'status': 'success',
            'data': patient_data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print("\n[Python Backend] Unhandled Error")
        print("=" * 50)
        print(f"- Error: {str(e)}")
        print(f"- Type: {type(e).__name__}")
        print("- Stack trace:", traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'type': type(e).__name__,
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

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