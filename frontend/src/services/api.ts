import axios from "axios";
import { JsonRpcProvider, Contract, keccak256, toUtf8Bytes } from "ethers";

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function storePatientData(uint256 _patientId, string _demographicsHash, string _medicalHistoryHash, string _motorFunctionHash, string _speechSwallowingHash, string _respiratorySleepHash, string _cognitiveHealthHash)",
  "function getPatientData(uint256 _patientId) view returns (tuple(uint256 patientId, string demographicsHash, string medicalHistoryHash, string motorFunctionHash, string speechSwallowingHash, string respiratorySleepHash, string cognitiveHealthHash, uint256 timestamp))",
];

export interface VisualizationData {
  metrics: {
    motor_function: {
      gait: {
        strideLength?: string;
        stepCount?: string;
        fallFrequency?: string;
      };
      muscle_weakness: {
        gripStrength?: string;
        mobilityTest?: string;
      };
    };
    speech: {
      speechClarity?: string;
      swallowingDifficulty?: string;
      facialControl?: string;
      last_assessment?: string;
    };
    cognitive: {
      memoryDecline?: string;
      hallucinations?: string;
      last_assessment?: string;
    };
    medication: {
      missed_doses?: number;
      side_effects?: string[];
      adherence?: string;
    };
  };
  timestamps: {
    last_updated: string;
    data_collected: string;
  };
}

export interface FrequencyAnalysisData {
  symptom_frequency: {
    falls: number;
    medication_missed: number;
    side_effects: number;
    emergency_triggers: number;
  };
  temporal_analysis: {
    assessment_dates: {
      last_motor_assessment?: string;
      last_speech_assessment?: string;
      last_cognitive_assessment?: string;
    };
  };
  metadata: {
    analysis_timestamp: string;
    data_period: string;
  };
}

export interface PatientData {
  user_id: string;
  personal_info: {
    name: string;
    dateOfBirth: string;
    patientAge: string;
    patientGender: string;
  };
  demographics: {
    age: number;
    gender: string;
    location: string;
  };
  medicalHistory: {
    diagnosisDate: string;
    diagnosisStage: string;
    familyHistory: string;
    medications: string[];
    comorbidities: string;
    hospitalizations: string;
    allergies: string;
  };
  assessments: {
    motorFunction: {
      gaitMetrics: {
        strideLength: string;
        stepCount: string;
        fallFrequency: string;
      };
      muscleWeakness: {
        gripStrength: string;
        mobilityTest: string;
      };
      last_assessment?: string;
    };
    cognitiveHealth: {
      memoryDecline: string;
      hallucinations: string;
      last_assessment?: string;
    };
    speech: {
      score: number;
      notes: string;
    };
    mobility: {
      score: number;
      notes: string;
    };
    breathing: {
      score: number;
      notes: string;
    };
  };
  speech_swallowing: {
    speechClarity: string;
    swallowingDifficulty: string;
    facialControl: string;
    last_assessment?: string;
  };
  medication_adherence: {
    missed_doses: number;
    side_effects: string[];
    adherence: string;
  };
  caregiverInfo: {
    primaryCaregiver: string;
    emergencyContact: string;
    relationship: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CaregiverAdvice {
  generalAdvice: Array<{
    id: number;
    title: string;
    content: string;
    category: string;
  }>;
  emergencyGuidelines: {
    breathing: string;
    falls: string;
  };
  resources: Array<{
    name: string;
    link: string;
    type: string;
  }>;
}

interface BlockchainResponse {
  success: boolean;
  txHash: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  details?: string;
}

// Validation types
export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

class ApiService {
  private provider: JsonRpcProvider;
  private contract: Contract;

  constructor() {
    this.provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    this.contract = new Contract(
      CONTRACT_ADDRESS!,
      CONTRACT_ABI,
      this.provider,
    );
  }

  private hashData(data: Record<string, unknown>) {
    return keccak256(toUtf8Bytes(JSON.stringify(data)));
  }

  // Validation methods
  private validateVisualizationData(data: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const typedData = data as Partial<VisualizationData>;

    if (!typedData.metrics) {
      errors.push({ field: "metrics", message: "Metrics are required" });
    } else {
      // Validate motor function
      if (!typedData.metrics.motor_function) {
        errors.push({
          field: "motor_function",
          message: "Motor function data is required",
        });
      } else {
        const { gait, muscle_weakness } = typedData.metrics.motor_function;
        if (!gait || !muscle_weakness) {
          errors.push({
            field: "motor_function",
            message: "Incomplete motor function data",
          });
        }
      }

      // Validate speech
      if (!typedData.metrics.speech) {
        errors.push({ field: "speech", message: "Speech data is required" });
      }

      // Validate cognitive
      if (!typedData.metrics.cognitive) {
        errors.push({
          field: "cognitive",
          message: "Cognitive data is required",
        });
      }
    }

    if (!typedData.timestamps) {
      errors.push({ field: "timestamps", message: "Timestamps are required" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateFrequencyData(data: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const typedData = data as Partial<FrequencyAnalysisData>;

    if (!typedData.symptom_frequency) {
      errors.push({
        field: "symptom_frequency",
        message: "Symptom frequency data is required",
      });
    } else {
      const { falls, medication_missed, side_effects, emergency_triggers } =
        typedData.symptom_frequency;
      if (
        typeof falls !== "number" ||
        typeof medication_missed !== "number" ||
        typeof side_effects !== "number" ||
        typeof emergency_triggers !== "number"
      ) {
        errors.push({
          field: "symptom_frequency",
          message: "Invalid frequency data types",
        });
      }
    }

    if (!typedData.temporal_analysis) {
      errors.push({
        field: "temporal_analysis",
        message: "Temporal analysis data is required",
      });
    }

    if (!typedData.metadata) {
      errors.push({ field: "metadata", message: "Metadata is required" });
    } else {
      if (
        !typedData.metadata.analysis_timestamp ||
        !typedData.metadata.data_period
      ) {
        errors.push({ field: "metadata", message: "Incomplete metadata" });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Enhanced error handling for API calls
  private async handleApiResponse<T>(
    response: Response,
    validator?: (data: unknown) => ValidationResult,
  ): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `API request failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    if (validator) {
      const validationResult = validator(data);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(", ")}`,
        );
      }
    }

    return data;
  }

  // Python backend endpoints with enhanced error handling
  async getPatientData(userId: string): Promise<PatientData> {
    try {
      const response = await fetch(`/api/patient-data/${userId}`);
      return this.handleApiResponse<PatientData>(response);
    } catch (error) {
      console.error("[ApiService] Failed to fetch patient data:", error);
      throw error;
    }
  }

  async getCaregiverAdvice(userId: string): Promise<CaregiverAdvice> {
    try {
      const response = await fetch(`/api/caregiver-advice/${userId}`);
      return this.handleApiResponse<CaregiverAdvice>(response);
    } catch (error) {
      console.error("[ApiService] Failed to fetch caregiver advice:", error);
      throw error;
    }
  }

  async submitAssessment(data: Partial<PatientData>): Promise<PatientData> {
    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return this.handleApiResponse<PatientData>(response);
    } catch (error) {
      console.error("[ApiService] Failed to submit assessment:", error);
      throw error;
    }
  }

  // Blockchain endpoints with enhanced error handling
  async storePatientDataOnChain(
    patientId: string,
    data: PatientData,
  ): Promise<BlockchainResponse> {
    try {
      const response = await axios.post("/api/patient-data", {
        patientData: data,
      });
      return response.data;
    } catch (error) {
      console.error("[ApiService] Error storing patient data on chain:", error);
      throw error;
    }
  }

  async getPatientDataFromChain(patientId: string): Promise<{
    patientId: string;
    timestamp: string;
    hashes: {
      demographics: string;
      medicalHistory: string;
      motorFunction: string;
      speechSwallowing: string;
      respiratorySleep: string;
      cognitiveHealth: string;
    };
  }> {
    try {
      const data = await this.contract.getPatientData(patientId);
      return {
        patientId: data.patientId.toString(),
        timestamp: data.timestamp.toString(),
        hashes: {
          demographics: data.demographicsHash,
          medicalHistory: data.medicalHistoryHash,
          motorFunction: data.motorFunctionHash,
          speechSwallowing: data.speechSwallowingHash,
          respiratorySleep: data.respiratorySleepHash,
          cognitiveHealth: data.cognitiveHealthHash,
        },
      };
    } catch (error) {
      console.error(
        "[ApiService] Error fetching patient data from chain:",
        error,
      );
      throw error;
    }
  }

  // Helper method to verify data integrity with fixed property access
  async verifyDataIntegrity(
    patientId: string,
    data: PatientData,
  ): Promise<boolean> {
    try {
      const chainData = await this.getPatientDataFromChain(patientId);

      // Verify each section's hash
      const verified = {
        demographics:
          this.hashData(data.demographics) === chainData.hashes.demographics,
        medicalHistory:
          this.hashData(data.medicalHistory) ===
          chainData.hashes.medicalHistory,
        motorFunction:
          this.hashData(data.assessments.motorFunction) ===
          chainData.hashes.motorFunction,
        speechSwallowing:
          this.hashData(data.speech_swallowing) ===
          chainData.hashes.speechSwallowing,
        respiratorySleep:
          this.hashData(data.assessments.breathing) ===
          chainData.hashes.respiratorySleep,
        cognitiveHealth:
          this.hashData(data.assessments.cognitiveHealth) ===
          chainData.hashes.cognitiveHealth,
      };

      // Return true only if all sections match
      return Object.values(verified).every((v) => v);
    } catch (error) {
      console.error("[ApiService] Error verifying data integrity:", error);
      return false;
    }
  }
}

export const apiService = new ApiService();
