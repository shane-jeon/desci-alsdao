import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientAge: String,
  patientGender: String,
  dateOfBirth: String,
  diagnosisDate: String,
  diagnosisStage: String,
  medicalHistory: {
    comorbidities: String,
    hospitalizations: String,
    allergies: String,
  },
  currentMedications: [String],
  familyHistory: String,
  caregiverInfo: {
    primaryCaregiver: String,
    emergencyContact: String,
  },
  gaitMetrics: {
    strideLength: String,
    stepCount: String,
    fallFrequency: String,
  },
  tremorMetrics: String,
  muscleWeakness: {
    gripStrength: String,
    mobilityTest: String,
  },
  dyskinesia: String,
  handwriting: String,
  assistiveDevice: [String],
  speechClarity: String,
  swallowingDifficulty: String,
  facialControl: String,
  breathingPatterns: String,
  sleepQuality: String,
  memoryDecline: String,
  hallucinations: String,
  medicationAdherence: String,
  sideEffects: [String],
  emergencyAlertTriggers: [String],
  caregiverStress: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Assessment ||
  mongoose.model("Assessment", AssessmentSchema);
