import mongoose from "mongoose";

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  personal_info: {
    name: {
      type: String,
      required: true,
    },
    dateOfBirth: String,
    patientAge: String,
    patientGender: String,
  },
  medicalHistory: {
    diagnosisDate: String,
    diagnosisStage: String,
    comorbidities: String,
    hospitalizations: String,
    allergies: String,
    familyHistory: String,
    medications: [String],
  },
  assessments: {
    motor_function: {
      gait_metrics: {
        strideLength: String,
        stepCount: String,
        fallFrequency: String,
      },
      tremor_metrics: String,
      muscle_weakness: {
        gripStrength: String,
        mobilityTest: String,
      },
      dyskinesia: String,
      handwriting: String,
      assistive_device: [String],
    },
    speech_swallowing: {
      speech_clarity: String,
      swallowing_difficulty: String,
      facial_control: String,
    },
    respiratory: {
      breathing_patterns: String,
    },
    cognitive_behavioral: {
      sleep_quality: String,
      memory_decline: String,
      hallucinations: String,
    },
  },
  medication_adherence: {
    adherence_level: String,
    side_effects: [String],
  },
  caregiver_info: {
    primaryCaregiver: String,
    emergencyContact: String,
  },
  emergency_info: {
    alert_triggers: [String],
    caregiver_stress_level: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Assessment ||
  mongoose.model("Assessment", AssessmentSchema);
