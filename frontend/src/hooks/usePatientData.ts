import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { apiService, PatientData, CaregiverAdvice } from "../services/api";

interface ApiError {
  message: string;
  details?: string;
}

interface UsePatientDataState {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | ApiError | null;
  isSignedIn: boolean | undefined;
  patientData: PatientData | null;
  caregiverAdvice: CaregiverAdvice | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 5000; // 5 seconds

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES,
): Promise<Response> {
  console.log(
    `[fetchWithRetry] Attempting to fetch ${url}, retries left: ${retries}`,
  );
  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(
        `[fetchWithRetry] Retrying in ${RETRY_DELAY}ms...`,
        error instanceof Error ? error.message : error,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

function validatePatientData(data: unknown): data is PatientData {
  console.log(
    "[validatePatientData] Received data:",
    JSON.stringify(data, null, 2),
  );

  if (!data || typeof data !== "object") {
    console.log("[validatePatientData] Data is not an object");
    return false;
  }

  // Type assertion after basic check
  const typedData = data as Record<string, unknown>;

  // Check required sections
  const requiredSections = [
    "demographics",
    "medicalHistory",
    "assessments",
  ] as const;

  for (const section of requiredSections) {
    if (!(section in typedData)) {
      console.log(`[validatePatientData] Missing section: ${section}`);
      return false;
    }
    if (!typedData[section] || typeof typedData[section] !== "object") {
      console.log(`[validatePatientData] Invalid section: ${section}`);
      return false;
    }
  }

  // Additional validation for nested objects
  const assessments = typedData.assessments as Record<string, unknown>;
  if (
    !assessments.motorFunction ||
    typeof assessments.motorFunction !== "object"
  ) {
    console.log(
      "[validatePatientData] Missing or invalid motorFunction in assessments",
    );
    return false;
  }

  console.log("[validatePatientData] All sections validated successfully");
  return true;
}

export function usePatientData(): UsePatientDataState {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [state, setState] = useState<UsePatientDataState>({
    isLoaded: false,
    isLoading: true,
    error: null,
    isSignedIn: undefined,
    patientData: null,
    caregiverAdvice: null,
  });

  useEffect(() => {
    async function fetchData() {
      if (!isSignedIn || !userId) {
        setState((prev) => ({
          ...prev,
          isLoaded: true,
          isLoading: false,
          isSignedIn: false,
        }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Get data from localStorage
        const storedData = localStorage.getItem("patientAssessment");
        if (storedData) {
          const formData = JSON.parse(storedData);

          // Format the data to match the PatientData interface
          const patientData = {
            user_id: userId,
            demographics: {
              age: formData.patientAge,
              gender: formData.patientGender,
              location: "N/A",
            },
            personal_info: {
              name: formData.patientName,
              patientAge: formData.patientAge,
              patientGender: formData.patientGender,
              dateOfBirth: formData.dateOfBirth,
            },
            medicalHistory: {
              diagnosisDate: formData.diagnosisDate,
              diagnosisStage: formData.diagnosisStage,
              familyHistory: formData.familyHistory,
              medications: formData.currentMedications,
              comorbidities: formData.medicalHistory.comorbidities,
              hospitalizations: formData.medicalHistory.hospitalizations,
              allergies: formData.medicalHistory.allergies,
            },
            caregiverInfo: {
              primaryCaregiver: formData.caregiverInfo.primaryCaregiver,
              emergencyContact: formData.caregiverInfo.emergencyContact,
            },
            assessments: {
              motorFunction: {
                gaitMetrics: formData.gaitMetrics,
                muscleWeakness: formData.muscleWeakness,
              },
              cognitiveHealth: {
                memoryDecline: formData.memoryDecline,
                hallucinations: formData.hallucinations,
                last_assessment: formData.timestamp,
              },
            },
            speech_swallowing: {
              speechClarity: formData.speechClarity,
              swallowingDifficulty: formData.swallowingDifficulty,
            },
            medication_adherence: {
              current_medications: formData.currentMedications,
              side_effects: formData.sideEffects,
              missed_doses: "0",
            },
            assistive_devices: formData.assistiveDevice,
            sleep_quality: formData.sleepQuality,
          };

          setState({
            isLoaded: true,
            isLoading: false,
            error: null,
            isSignedIn: true,
            patientData,
            caregiverAdvice: null,
          });
        } else {
          setState({
            isLoaded: true,
            isLoading: false,
            error: null,
            isSignedIn: true,
            patientData: null,
            caregiverAdvice: null,
          });
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setState({
          isLoaded: true,
          isLoading: false,
          error:
            error instanceof Error
              ? error
              : new Error("Unknown error occurred"),
          isSignedIn: true,
          patientData: null,
          caregiverAdvice: null,
        });
      }
    }

    if (user) {
      fetchData();
    }
  }, [isSignedIn, userId, user]);

  const storePatientData = async (data: PatientData) => {
    if (!userId) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetchWithTimeout(`/api/patient-data/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientData: data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to store data",
        );
      }

      setState((prev) => ({
        ...prev,
        patientData: data,
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error("Failed to store data"),
      }));
      throw err;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const verifyDataIntegrity = async () => {
    if (!userId || !state.patientData) return false;

    try {
      return await apiService.verifyDataIntegrity(userId, state.patientData);
    } catch (err) {
      console.error("Error verifying data integrity:", err);
      return false;
    }
  };

  return {
    ...state,
    storePatientData,
    verifyDataIntegrity,
  };
}
