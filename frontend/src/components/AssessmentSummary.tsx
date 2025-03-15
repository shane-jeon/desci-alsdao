import { PatientData } from "@/services/api";

interface AssessmentSummaryProps {
  patientData: PatientData | null;
  isLoading?: boolean;
}

export default function AssessmentSummary({
  patientData,
  isLoading = false,
}: AssessmentSummaryProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-gray-500">Loading patient data...</div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-gray-500">No assessment data available</div>
      </div>
    );
  }

  // Early return if essential data is missing
  if (
    !patientData.personal_info ||
    !patientData.medical_history ||
    !patientData.motor_function ||
    !patientData.speech_swallowing
  ) {
    console.warn("Incomplete patient data:", {
      hasPersonalInfo: !!patientData.personal_info,
      hasMedicalHistory: !!patientData.medical_history,
      hasMotorFunction: !!patientData.motor_function,
      hasSpeechSwallowing: !!patientData.speech_swallowing,
    });

    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-gray-500">
          Patient data is incomplete or malformed
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">
          Patient Assessment Summary
        </h3>
        {patientData.latest_assessment?.date && (
          <span className="text-xs text-gray-500">
            Last assessment:{" "}
            {new Date(patientData.latest_assessment.date).toLocaleString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-3 font-medium text-black">Personal Information</h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Name:</dt>
              <dd className="text-black">
                {patientData.personal_info?.name || "Not provided"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Age:</dt>
              <dd className="text-black">
                {patientData.personal_info?.age || "Not provided"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Gender:</dt>
              <dd className="capitalize text-black">
                {patientData.personal_info?.gender || "Not provided"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Location:</dt>
              <dd className="text-black">
                {patientData.personal_info?.location || "Not provided"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-3 font-medium text-black">Medical History</h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Diagnosis Date:</dt>
              <dd className="text-black">
                {patientData.medical_history?.diagnosis_date
                  ? new Date(
                      patientData.medical_history.diagnosis_date,
                    ).toLocaleDateString()
                  : "Not provided"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Family History:</dt>
              <dd className="text-black">
                {patientData.medical_history?.family_history || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Current Medications:</dt>
              <dd className="mt-1">
                {patientData.medical_history?.current_medications?.length ? (
                  <ul className="list-disc pl-5">
                    {patientData.medical_history.current_medications.map(
                      (medication, index) => (
                        <li key={index} className="text-black">
                          {medication}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <span className="text-black">No medications listed</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="col-span-2 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-3 font-medium text-black">Motor Function</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-gray-600">Upper Limb Strength</dt>
              <dd className="text-lg font-medium text-black">
                {patientData.motor_function?.upper_limb_strength
                  ? `${patientData.motor_function.upper_limb_strength}/5`
                  : "Not assessed"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Lower Limb Strength</dt>
              <dd className="text-lg font-medium text-black">
                {patientData.motor_function?.lower_limb_strength
                  ? `${patientData.motor_function.lower_limb_strength}/5`
                  : "Not assessed"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Balance</dt>
              <dd className="text-lg font-medium text-black">
                {patientData.motor_function?.balance || "Not assessed"}
              </dd>
            </div>
            {patientData.motor_function?.last_assessment && (
              <div className="text-sm text-gray-500">
                Last assessed:{" "}
                {new Date(
                  patientData.motor_function.last_assessment,
                ).toLocaleDateString()}
              </div>
            )}
          </dl>
        </div>

        <div className="col-span-2 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-3 font-medium text-black">Speech & Swallowing</h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Speech Clarity:</dt>
              <dd className="capitalize text-black">
                {patientData.speech_swallowing?.speech_clarity ||
                  "Not assessed"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Swallowing Ability:</dt>
              <dd className="capitalize text-black">
                {patientData.speech_swallowing?.swallowing_ability ||
                  "Not assessed"}
              </dd>
            </div>
            {patientData.speech_swallowing?.last_assessment && (
              <div className="text-sm text-gray-500">
                Last assessed:{" "}
                {new Date(
                  patientData.speech_swallowing.last_assessment,
                ).toLocaleDateString()}
              </div>
            )}
          </dl>
        </div>

        {patientData.latest_assessment && (
          <div className="col-span-2 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-3 font-medium text-black">
              Latest Assessment Summary
            </h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">ALSFRS-R Score:</dt>
                <dd className="text-black">
                  {patientData.latest_assessment.alsfrs_r_score
                    ? `${patientData.latest_assessment.alsfrs_r_score}/48`
                    : "Not assessed"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Progression Rate:</dt>
                <dd className="capitalize text-black">
                  {patientData.latest_assessment.progression_rate ||
                    "Not assessed"}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
