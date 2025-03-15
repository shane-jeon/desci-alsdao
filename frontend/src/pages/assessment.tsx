import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser, useSession } from "@clerk/nextjs";

interface FormData {
  userId?: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  dateOfBirth: string;
  diagnosisDate: string;
  diagnosisStage: string;
  medicalHistory: {
    comorbidities: string;
    hospitalizations: string;
    allergies: string;
  };
  currentMedications: string[];
  familyHistory: string;
  caregiverInfo: {
    primaryCaregiver: string;
    emergencyContact: string;
  };
  gaitMetrics: {
    strideLength: string;
    stepCount: string;
    fallFrequency: string;
  };
  tremorMetrics: string;
  muscleWeakness: {
    gripStrength: string;
    mobilityTest: string;
  };
  dyskinesia: string;
  handwriting: string;
  assistiveDevice: string[];
  speechClarity: string;
  swallowingDifficulty: string;
  facialControl: string;
  breathingPatterns: string;
  sleepQuality: string;
  memoryDecline: string;
  hallucinations: string;
  medicationAdherence: string;
  sideEffects: string[];
  emergencyAlertTriggers: string[];
  caregiverStress: string;
  timestamp?: string;
}

interface FormErrors {
  [key: string]: string;
}

const REQUIRED_FIELDS = [
  "patientName",
  "patientAge",
  "patientGender",
  "diagnosisDate",
  "diagnosisStage",
  "medicalHistory.comorbidities",
  "medicalHistory.hospitalizations",
  "medicalHistory.allergies",
  "currentMedications",
  "familyHistory",
  "caregiverInfo.primaryCaregiver",
  "caregiverInfo.emergencyContact",
  "gaitMetrics.strideLength",
  "gaitMetrics.stepCount",
  "gaitMetrics.fallFrequency",
  "tremorMetrics",
  "muscleWeakness.gripStrength",
  "muscleWeakness.mobilityTest",
  "dyskinesia",
  "handwriting",
  "assistiveDevice",
  "speechClarity",
  "swallowingDifficulty",
  "facialControl",
  "breathingPatterns",
  "sleepQuality",
  "memoryDecline",
  "hallucinations",
  "medicationAdherence",
  "sideEffects",
  "emergencyAlertTriggers",
  "caregiverStress",
] as const;

const INITIAL_FORM_STATE: FormData = {
  patientName: "",
  patientAge: "",
  patientGender: "",
  dateOfBirth: "",
  diagnosisDate: "",
  diagnosisStage: "",
  medicalHistory: {
    comorbidities: "",
    hospitalizations: "",
    allergies: "",
  },
  currentMedications: [],
  familyHistory: "",
  caregiverInfo: {
    primaryCaregiver: "",
    emergencyContact: "",
  },
  gaitMetrics: {
    strideLength: "",
    stepCount: "",
    fallFrequency: "",
  },
  tremorMetrics: "",
  muscleWeakness: {
    gripStrength: "",
    mobilityTest: "",
  },
  dyskinesia: "",
  handwriting: "",
  assistiveDevice: [],
  speechClarity: "",
  swallowingDifficulty: "",
  facialControl: "",
  breathingPatterns: "",
  sleepQuality: "",
  memoryDecline: "",
  hallucinations: "",
  medicationAdherence: "",
  sideEffects: [],
  emergencyAlertTriggers: [],
  caregiverStress: "",
};

const debugLog = (context: string, data?: unknown) => {
  console.log(`[Assessment:${context}]`, data);
};

type NestedValue = string | string[] | { [key: string]: NestedValue };

const getNestedValue = (
  obj: FormData,
  path: string,
): string | string[] | undefined => {
  const value = path.split(".").reduce((acc: any, key: string) => {
    return acc && typeof acc === "object" ? acc[key] : undefined;
  }, obj);

  return Array.isArray(value) || typeof value === "string" ? value : undefined;
};

const PatientAssessmentForm = () => {
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStatus, setSubmissionStatus] = useState<
    "success" | "error" | null
  >(null);
  const [submissionMessage, setSubmissionMessage] = useState<string>("");

  useEffect(() => {
    if (user) {
      const hasCompletedAssessment =
        user.unsafeMetadata?.hasCompletedAssessment;
      if (hasCompletedAssessment) {
        debugLog(
          "User has already completed assessment, redirecting to dashboard",
        );
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      setFormData((prev) => ({ ...prev, patientAge: age }));
    }
  }, [formData.dateOfBirth]);

  const calculateAge = (dob: string): string => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    debugLog("Field Change", { name, value, type });

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMultiSelect = (
    field: keyof FormData,
    value: string,
    checked: boolean,
  ) => {
    debugLog("MultiSelect Change", { field, value, checked });
    setFormData((prev) => {
      const currentValue = prev[field] as string[];
      const newValue = checked
        ? [...currentValue, value]
        : currentValue.filter((v) => v !== value);
      return {
        ...prev,
        [field]: newValue,
      };
    });
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const formatFieldName = (field: string): string => {
      const fieldName = field.split(".").pop() || field;
      return fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    REQUIRED_FIELDS.forEach((field) => {
      const value = getNestedValue(formData, field);
      if (!value || (Array.isArray(value) && value.length === 0)) {
        newErrors[field] = `${formatFieldName(field)} is required`;
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    debugLog("Form Submission Started");

    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const submissionData = {
        ...formData,
        userId: user.id,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage instead of sending to backend
      localStorage.setItem("patientAssessment", JSON.stringify(submissionData));

      // Update user metadata to mark assessment as completed
      if (user.update) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            hasCompletedAssessment: true,
          },
        });
      }

      setSubmissionStatus("success");
      setSubmissionMessage("Assessment submitted successfully!");
      setFormData(INITIAL_FORM_STATE);
      setErrors({});

      // Redirect to dashboard with correct path
      router.push("/dashboard");
    } catch (error) {
      debugLog("Error", error);
      setSubmissionStatus("error");
      setSubmissionMessage(
        error instanceof Error ? error.message : "Failed to submit assessment",
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Patient Assessment Form
        </h2>

        {/* Show submission status */}
        {submissionStatus && (
          <div
            className={`rounded-lg p-4 ${
              submissionStatus === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
            {submissionMessage}
          </div>
        )}

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please fill in all required fields
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc space-y-1 pl-5">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Patient Demographics & Medical History */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Demographics & Medical History
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="patientName"
              placeholder="Patient Name"
              value={formData.patientName}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.patientName ? "border-red-500" : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
            />
            {errors.patientName && (
              <p className="text-sm text-red-500">{errors.patientName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded border border-gray-300 p-2 text-black"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Age (auto-calculated)
            </label>
            <input
              type="text"
              name="patientAge"
              value={formData.patientAge}
              readOnly
              className="w-full rounded border border-gray-300 bg-gray-50 p-2 text-black"
            />
          </div>

          <select
            name="patientGender"
            value={formData.patientGender}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2 text-black">
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date of Diagnosis
            </label>
            <input
              type="date"
              name="diagnosisDate"
              value={formData.diagnosisDate}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded border border-gray-300 p-2 text-black"
            />
            <p className="text-sm text-gray-500">
              When was the patient first diagnosed with ALS/PD?
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Disease Stage
            </label>
            <select
              name="diagnosisStage"
              value={formData.diagnosisStage}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 p-2 text-black">
              <option value="">Select Diagnosis Stage</option>
              <option value="1">Stage 1 - Mild unilateral involvement</option>
              <option value="2">Stage 2 - Bilateral involvement</option>
              <option value="3">
                Stage 3 - Mild to moderate bilateral disease
              </option>
              <option value="4">Stage 4 - Severe disability</option>
              <option value="5">Stage 5 - Wheelchair bound or bedridden</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Medical History <span className="text-red-500">*</span>
            </label>
            <textarea
              name="medicalHistory.comorbidities"
              placeholder="Comorbidities (required)"
              value={formData.medicalHistory.comorbidities}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["medicalHistory.comorbidities"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
              rows={3}
            />
            {errors["medicalHistory.comorbidities"] && (
              <p className="text-sm text-red-500">
                {errors["medicalHistory.comorbidities"]}
              </p>
            )}

            <textarea
              name="medicalHistory.hospitalizations"
              placeholder="Previous Hospitalizations (required)"
              value={formData.medicalHistory.hospitalizations}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["medicalHistory.hospitalizations"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
              rows={3}
            />
            {errors["medicalHistory.hospitalizations"] && (
              <p className="text-sm text-red-500">
                {errors["medicalHistory.hospitalizations"]}
              </p>
            )}

            <textarea
              name="medicalHistory.allergies"
              placeholder="Allergies (required)"
              value={formData.medicalHistory.allergies}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["medicalHistory.allergies"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
              rows={2}
            />
            {errors["medicalHistory.allergies"] && (
              <p className="text-sm text-red-500">
                {errors["medicalHistory.allergies"]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">
              Current Medications <span className="text-red-500">*</span>
            </h4>
            <div className="space-y-1">
              {["Levodopa", "Riluzole", "Edaravone", "Other"].map((med) => (
                <label key={med} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.currentMedications.includes(med)}
                    onChange={(e) =>
                      handleMultiSelect(
                        "currentMedications",
                        med,
                        e.target.checked,
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{med}</span>
                </label>
              ))}
            </div>
            {errors.currentMedications && (
              <p className="text-sm text-red-500">
                {errors.currentMedications}
              </p>
            )}
          </div>

          {/* Family History */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Family History <span className="text-red-500">*</span>
            </label>
            <textarea
              name="familyHistory"
              placeholder="Family history of neurological conditions"
              value={formData.familyHistory}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.familyHistory ? "border-red-500" : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
              rows={3}
            />
            {errors.familyHistory && (
              <p className="text-sm text-red-500">{errors.familyHistory}</p>
            )}
          </div>

          {/* Caregiver Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Caregiver Information</h4>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Primary Caregiver <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="caregiverInfo.primaryCaregiver"
                placeholder="Name and relationship to patient"
                value={formData.caregiverInfo.primaryCaregiver}
                onChange={handleChange}
                className={`w-full rounded border ${
                  errors["caregiverInfo.primaryCaregiver"]
                    ? "border-red-500"
                    : "border-gray-300"
                } p-2 text-black placeholder-gray-600`}
              />
              {errors["caregiverInfo.primaryCaregiver"] && (
                <p className="text-sm text-red-500">
                  {errors["caregiverInfo.primaryCaregiver"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Emergency Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="caregiverInfo.emergencyContact"
                placeholder="Name and phone number"
                value={formData.caregiverInfo.emergencyContact}
                onChange={handleChange}
                className={`w-full rounded border ${
                  errors["caregiverInfo.emergencyContact"]
                    ? "border-red-500"
                    : "border-gray-300"
                } p-2 text-black placeholder-gray-600`}
              />
              {errors["caregiverInfo.emergencyContact"] && (
                <p className="text-sm text-red-500">
                  {errors["caregiverInfo.emergencyContact"]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Caregiver Stress Level <span className="text-red-500">*</span>
              </label>
              <select
                name="caregiverStress"
                value={formData.caregiverStress}
                onChange={handleChange}
                className={`w-full rounded border ${
                  errors.caregiverStress ? "border-red-500" : "border-gray-300"
                } p-2 text-black`}>
                <option value="">Select Stress Level</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="severe">Severe</option>
              </select>
              {errors.caregiverStress && (
                <p className="text-sm text-red-500">{errors.caregiverStress}</p>
              )}
            </div>
          </div>
        </section>

        {/* 2. Motor & Physical Function */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Motor & Physical Function
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Gait Metrics <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gaitMetrics.strideLength"
              placeholder="Stride Length (cm)"
              value={formData.gaitMetrics.strideLength}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["gaitMetrics.strideLength"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
            />
            <input
              type="number"
              name="gaitMetrics.stepCount"
              placeholder="Daily Step Count"
              value={formData.gaitMetrics.stepCount}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["gaitMetrics.stepCount"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
            />
            <input
              type="number"
              name="gaitMetrics.fallFrequency"
              placeholder="Falls per Month"
              value={formData.gaitMetrics.fallFrequency}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["gaitMetrics.fallFrequency"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tremor Metrics <span className="text-red-500">*</span>
            </label>
            <select
              name="tremorMetrics"
              value={formData.tremorMetrics}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.tremorMetrics ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Tremor Severity</option>
              <option value="none">No tremors</option>
              <option value="mild">Mild tremors</option>
              <option value="moderate">Moderate tremors</option>
              <option value="severe">Severe tremors</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Muscle Weakness <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="muscleWeakness.gripStrength"
              placeholder="Grip Strength Measurement"
              value={formData.muscleWeakness.gripStrength}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["muscleWeakness.gripStrength"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black placeholder-gray-600`}
            />
            <select
              name="muscleWeakness.mobilityTest"
              value={formData.muscleWeakness.mobilityTest}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors["muscleWeakness.mobilityTest"]
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Mobility Level</option>
              <option value="independent">Independent</option>
              <option value="minimalAssistance">Minimal Assistance</option>
              <option value="moderateAssistance">Moderate Assistance</option>
              <option value="maximumAssistance">Maximum Assistance</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Dyskinesia <span className="text-red-500">*</span>
            </label>
            <select
              name="dyskinesia"
              value={formData.dyskinesia}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.dyskinesia ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Severity</option>
              <option value="none">None</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Handwriting Assessment <span className="text-red-500">*</span>
            </label>
            <select
              name="handwriting"
              value={formData.handwriting}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.handwriting ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Handwriting Quality</option>
              <option value="normal">Normal</option>
              <option value="slightlyImpaired">Slightly Impaired</option>
              <option value="moderatelyImpaired">Moderately Impaired</option>
              <option value="severelyImpaired">Severely Impaired</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Assistive Devices <span className="text-red-500">*</span>
            </label>
            <select
              name="assistiveDevice"
              multiple
              value={formData.assistiveDevice}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions).map(
                  (option) => option.value,
                );
                setFormData((prev) => ({ ...prev, assistiveDevice: options }));
              }}
              className={`w-full rounded border ${
                errors.assistiveDevice ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="walker">Walker</option>
              <option value="wheelchair">Wheelchair</option>
              <option value="cane">Cane</option>
              <option value="speechDevice">Speech Device</option>
              <option value="other">Other</option>
            </select>
            {errors.assistiveDevice && (
              <p className="text-sm text-red-500">{errors.assistiveDevice}</p>
            )}
          </div>
        </section>

        {/* 3. Speech & Swallowing Function */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Speech, Swallowing & Cognitive Function
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Speech Clarity <span className="text-red-500">*</span>
            </label>
            <select
              name="speechClarity"
              value={formData.speechClarity}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.speechClarity ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Speech Clarity Level</option>
              <option value="normal">Normal Speech</option>
              <option value="mild">Mild Impairment</option>
              <option value="moderate">Moderate Impairment</option>
              <option value="severe">Severe Impairment</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Swallowing Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              name="swallowingDifficulty"
              value={formData.swallowingDifficulty}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.swallowingDifficulty
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Swallowing Difficulty Level</option>
              <option value="none">No Difficulty</option>
              <option value="mild">Mild Difficulty</option>
              <option value="moderate">Moderate Difficulty</option>
              <option value="severe">
                Severe Difficulty - Modified Diet Required
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Facial Control <span className="text-red-500">*</span>
            </label>
            <select
              name="facialControl"
              value={formData.facialControl}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.facialControl ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Facial Control Level</option>
              <option value="normal">Normal</option>
              <option value="mild">Mild Impairment</option>
              <option value="moderate">Moderate Impairment</option>
              <option value="severe">Severe Impairment</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Breathing Patterns <span className="text-red-500">*</span>
            </label>
            <select
              name="breathingPatterns"
              value={formData.breathingPatterns}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.breathingPatterns ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Breathing Pattern</option>
              <option value="normal">Normal</option>
              <option value="shortness">Shortness of Breath</option>
              <option value="labored">Labored Breathing</option>
              <option value="rapid">Rapid Breathing</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sleep Quality <span className="text-red-500">*</span>
            </label>
            <select
              name="sleepQuality"
              value={formData.sleepQuality}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.sleepQuality ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Sleep Quality</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="veryPoor">Very Poor</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Memory Decline <span className="text-red-500">*</span>
            </label>
            <select
              name="memoryDecline"
              value={formData.memoryDecline}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.memoryDecline ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Memory Status</option>
              <option value="none">No Decline</option>
              <option value="mild">Mild Decline</option>
              <option value="moderate">Moderate Decline</option>
              <option value="severe">Severe Decline</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Hallucinations <span className="text-red-500">*</span>
            </label>
            <select
              name="hallucinations"
              value={formData.hallucinations}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.hallucinations ? "border-red-500" : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Frequency</option>
              <option value="none">None</option>
              <option value="rare">Rare</option>
              <option value="occasional">Occasional</option>
              <option value="frequent">Frequent</option>
            </select>
          </div>
        </section>

        {/* 4. Medication & Emergency */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Medication & Emergency Management
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Medication Adherence <span className="text-red-500">*</span>
            </label>
            <select
              name="medicationAdherence"
              value={formData.medicationAdherence}
              onChange={handleChange}
              className={`w-full rounded border ${
                errors.medicationAdherence
                  ? "border-red-500"
                  : "border-gray-300"
              } p-2 text-black`}>
              <option value="">Select Adherence Level</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Side Effects <span className="text-red-500">*</span>
            </label>
            <div className="space-y-1">
              {[
                "Nausea",
                "Dizziness",
                "Fatigue",
                "Insomnia",
                "Muscle Pain",
                "Other",
              ].map((effect) => (
                <label key={effect} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.includes(effect)}
                    onChange={(e) =>
                      handleMultiSelect("sideEffects", effect, e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{effect}</span>
                </label>
              ))}
            </div>
            {errors.sideEffects && (
              <p className="text-sm text-red-500">{errors.sideEffects}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Emergency Alert Triggers <span className="text-red-500">*</span>
            </label>
            <div className="space-y-1">
              {[
                "Severe Pain",
                "Difficulty Breathing",
                "Falls",
                "Medication Reaction",
                "Other",
              ].map((trigger) => (
                <label key={trigger} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.emergencyAlertTriggers.includes(trigger)}
                    onChange={(e) =>
                      handleMultiSelect(
                        "emergencyAlertTriggers",
                        trigger,
                        e.target.checked,
                      )
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{trigger}</span>
                </label>
              ))}
            </div>
            {errors.emergencyAlertTriggers && (
              <p className="text-sm text-red-500">
                {errors.emergencyAlertTriggers}
              </p>
            )}
          </div>
        </section>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
          Submit Assessment
        </button>
      </form>
    </div>
  );
};

export default PatientAssessmentForm;
