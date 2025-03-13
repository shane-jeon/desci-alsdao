from models.patient import Patient
import logging
from datetime import datetime
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_mongodb_connection():
    try:
        # Initialize patient model
        logger.info("Initializing Patient model...")
        patient_model = Patient()
        
        # Test data for multiple patients
        test_patients = [
            {
                'user_id': 'test_user_1',
                'personal_info': {
                    'name': 'Test Patient 1',
                    'dateOfBirth': '1990-01-01',
                    'patientAge': '33',
                    'patientGender': 'Male'
                }
            },
            {
                'user_id': 'test_user_2',
                'personal_info': {
                    'name': 'Test Patient 2',
                    'dateOfBirth': '1985-05-15',
                    'patientAge': '38',
                    'patientGender': 'Female'
                }
            }
        ]
        
        # Create multiple patients
        logger.info("Creating test patients...")
        for patient_data in test_patients:
            logger.info(f"Creating patient: {patient_data['personal_info']['name']}")
            success = patient_model.save_patient_data(patient_data['user_id'], patient_data)
            if success:
                logger.info(f"✅ Successfully created patient: {patient_data['personal_info']['name']}")
            else:
                logger.error(f"❌ Failed to create patient: {patient_data['personal_info']['name']}")
            
            # Add a small delay to make operations more visible in monitoring
            time.sleep(1)
        
        # Update a patient
        logger.info("Testing update operation...")
        update_data = {
            'personal_info': {
                'name': 'Updated Test Patient 1',
                'dateOfBirth': '1990-01-01',
                'patientAge': '33',
                'patientGender': 'Male'
            }
        }
        success = patient_model.save_patient_data('test_user_1', update_data)
        if success:
            logger.info("✅ Successfully updated patient")
        else:
            logger.error("❌ Failed to update patient")
        
        # Retrieve and verify data
        logger.info("Retrieving all test patients...")
        for user_id in ['test_user_1', 'test_user_2']:
            saved_data = patient_model.get_patient_by_user_id(user_id)
            if saved_data:
                logger.info(f"✅ Retrieved patient: {saved_data['personal_info']['name']}")
                logger.info(f"Created at: {saved_data['created_at']}")
                logger.info(f"Updated at: {saved_data['updated_at']}")
            else:
                logger.error(f"❌ Failed to retrieve patient with user_id: {user_id}")
            
            # Add a small delay between operations
            time.sleep(1)
            
    except Exception as e:
        logger.error(f"❌ Test failed with error: {str(e)}")
        raise

if __name__ == "__main__":
    logger.info("Starting MongoDB connection test...")
    test_mongodb_connection() 