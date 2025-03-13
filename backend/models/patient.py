from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
import ssl

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Patient:
    _instance = None
    _client = None
    _db = None
    _collection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Patient, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            try:
                # Get MongoDB connection string from environment
                mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
                logger.info(f"Connecting to MongoDB at: {mongo_uri}")
                
                # MongoDB connection with SSL configuration
                self._client = MongoClient(
                    mongo_uri,
                    serverSelectionTimeoutMS=5000,
                    tlsAllowInvalidCertificates=True  # This is for development only
                )
                
                # Test connection and log server info
                server_info = self._client.server_info()
                logger.info(f"Connected to MongoDB version: {server_info.get('version', 'unknown')}")
                
                # Set up database and collection
                self._db = self._client['alsdao']
                self._collection = self._db['patients']
                logger.info(f"Using database: alsdao, collection: patients")
                
                # List all databases to verify access
                databases = self._client.list_database_names()
                logger.info(f"Available databases: {databases}")
                
                # Ensure collection exists with schema
                self._ensure_collection()
                
                logger.info("Successfully connected to MongoDB")
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB: {str(e)}")
                self._client = None
                self._db = None
                self._collection = None
                raise

    def _ensure_collection(self):
        """Ensure the patients collection exists with the correct schema"""
        if self._db is None:
            raise Exception("Database connection not established")
            
        try:
            # Check if collection exists
            if 'patients' not in self._db.list_collection_names():
                self._db.create_collection('patients', **patient_schema)
                logger.info("Created patients collection with schema")
            else:
                # Update existing collection schema
                self._db.command('collMod', 'patients', **patient_schema)
                logger.info("Updated existing patients collection schema")
        except Exception as e:
            logger.error(f"Failed to ensure collection: {str(e)}")
            raise

    def create_patient(self, data):
        try:
            data['created_at'] = datetime.utcnow()
            data['updated_at'] = datetime.utcnow()
            result = self._collection.insert_one(data)
            logger.info(f"Created patient with ID: {result.inserted_id}")
            return result
        except Exception as e:
            logger.error(f"Failed to create patient: {str(e)}")
            raise

    def get_patient(self, patient_id):
        try:
            return self._collection.find_one({'_id': ObjectId(patient_id)})
        except Exception as e:
            logger.error(f"Failed to get patient: {str(e)}")
            raise

    def update_patient(self, patient_id, data):
        try:
            data['updated_at'] = datetime.utcnow()
            result = self._collection.update_one(
                {'_id': ObjectId(patient_id)},
                {'$set': data}
            )
            logger.info(f"Updated patient {patient_id}: {result.modified_count} documents modified")
            return result
        except Exception as e:
            logger.error(f"Failed to update patient: {str(e)}")
            raise

    def get_patient_by_user_id(self, user_id):
        try:
            return self._collection.find_one({'user_id': user_id})
        except Exception as e:
            logger.error(f"Failed to get patient by user_id: {str(e)}")
            raise

    def save_patient_data(self, user_id, data):
        """Save or update patient data by user_id"""
        if self._collection is None:
            raise Exception("Database connection not established")
            
        try:
            logger.info(f"Saving patient data for user {user_id}")
            existing_patient = self.get_patient_by_user_id(user_id)
            if existing_patient:
                # Update existing patient
                data['updated_at'] = datetime.utcnow()
                result = self._collection.update_one(
                    {'user_id': user_id},
                    {'$set': data}
                )
                success = result.modified_count > 0
                logger.info(f"Updated patient data for user {user_id}: {'success' if success else 'no changes'}")
                return success
            else:
                # Create new patient
                data['user_id'] = user_id  # Ensure user_id is set
                data['created_at'] = datetime.utcnow()
                data['updated_at'] = datetime.utcnow()
                result = self._collection.insert_one(data)
                success = result.inserted_id is not None
                logger.info(f"Created new patient data for user {user_id}: {'success' if success else 'failed'}")
                return success
        except Exception as e:
            logger.error(f"Failed to save patient data: {str(e)}")
            raise

# Schema validation for MongoDB
patient_schema = {
    'validator': {
        '$jsonSchema': {
            'bsonType': 'object',
            'required': ['user_id'],  # Only require user_id as mandatory
            'properties': {
                'user_id': {'bsonType': 'string'},
                'personal_info': {
                    'bsonType': 'object',
                    'properties': {
                        'name': {'bsonType': 'string'},
                        'dateOfBirth': {'bsonType': 'string'},
                        'patientAge': {'bsonType': 'string'},
                        'patientGender': {'bsonType': 'string'}
                    }
                },
                'demographics': {
                    'bsonType': 'object',
                    'properties': {
                        'age': {'bsonType': ['int', 'null']},
                        'gender': {'bsonType': 'string'},
                        'location': {'bsonType': 'string'}
                    }
                },
                'medicalHistory': {
                    'bsonType': 'object',
                    'properties': {
                        'diagnosisDate': {'bsonType': 'string'},
                        'diagnosisStage': {'bsonType': 'string'},
                        'familyHistory': {'bsonType': 'string'},
                        'medications': {'bsonType': 'array'},
                        'comorbidities': {'bsonType': 'string'},
                        'hospitalizations': {'bsonType': 'string'},
                        'allergies': {'bsonType': 'string'}
                    }
                },
                'assessments': {
                    'bsonType': 'object',
                    'properties': {
                        'speech': {
                            'bsonType': 'object',
                            'properties': {
                                'score': {'bsonType': ['int', 'null']},
                                'notes': {'bsonType': 'string'}
                            }
                        },
                        'mobility': {
                            'bsonType': 'object',
                            'properties': {
                                'score': {'bsonType': ['int', 'null']},
                                'notes': {'bsonType': 'string'}
                            }
                        },
                        'breathing': {
                            'bsonType': 'object',
                            'properties': {
                                'score': {'bsonType': ['int', 'null']},
                                'notes': {'bsonType': 'string'}
                            }
                        }
                    }
                },
                'caregiverInfo': {
                    'bsonType': 'object',
                    'properties': {
                        'primaryCaregiver': {'bsonType': 'string'},
                        'emergencyContact': {'bsonType': 'string'},
                        'relationship': {'bsonType': 'string'}
                    }
                },
                'additionalAssessments': {
                    'bsonType': 'object',
                    'properties': {
                        'tremorMetrics': {'bsonType': 'string'},
                        'muscleWeakness': {
                            'bsonType': 'object',
                            'properties': {
                                'gripStrength': {'bsonType': 'string'},
                                'mobilityTest': {'bsonType': 'string'}
                            }
                        },
                        'dyskinesia': {'bsonType': 'string'},
                        'handwriting': {'bsonType': 'string'},
                        'assistiveDevice': {'bsonType': 'array'},
                        'swallowingDifficulty': {'bsonType': 'string'},
                        'facialControl': {'bsonType': 'string'},
                        'sleepQuality': {'bsonType': 'string'},
                        'memoryDecline': {'bsonType': 'string'},
                        'hallucinations': {'bsonType': 'string'},
                        'medicationAdherence': {'bsonType': 'string'},
                        'sideEffects': {'bsonType': 'array'},
                        'emergencyAlertTriggers': {'bsonType': 'array'},
                        'caregiverStress': {'bsonType': 'string'}
                    }
                },
                'created_at': {'bsonType': 'date'},
                'updated_at': {'bsonType': 'date'}
            }
        }
    }
} 