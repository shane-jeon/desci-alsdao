"use client";

import { usePatientData } from "@/hooks/usePatientData";
import SpeechTracker from "@/components/SpeechTracker";
import SideEffectsChart from "@/components/SideEffectsChart";
import NeurofilamentCard from "@/components/NeurofilamentCard";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";

export default function DashboardPage() {
  const { patientData } = usePatientData();

  useEffect(() => {
    console.log("\n[Dashboard] Page Loaded");
    console.log("- Current path:", window.location.pathname);
    console.log("- Patient data:", patientData);
  }, [patientData]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            Welcome back{" "}
            {patientData?.caregiverInfo?.primaryCaregiver?.split(" ")[0] ||
              "Caregiver"}
            !
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">chat</span>
            <button className="rounded bg-gray-100 p-2">
              <svg
                className="h-4 w-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Patient Demographics Section */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Patient Demographics
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-medium text-gray-700">
                Personal Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">Name:</span>{" "}
                  {patientData?.personal_info?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">Age:</span>{" "}
                  {patientData?.personal_info?.patientAge || "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">Gender:</span>{" "}
                  {patientData?.personal_info?.patientGender || "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">Date of Birth:</span>{" "}
                  {patientData?.personal_info?.dateOfBirth || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-700">
                Medical History
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">Diagnosis Date:</span>{" "}
                  {patientData?.medicalHistory?.diagnosisDate || "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">Stage:</span>{" "}
                  {patientData?.medicalHistory?.diagnosisStage || "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-600">Allergies:</span>{" "}
                  {patientData?.medicalHistory?.allergies || "None"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-700">
                Caregiver Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Primary Caregiver:</span>{" "}
                  {patientData?.caregiverInfo?.primaryCaregiver || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Emergency Contact:</span>{" "}
                  {patientData?.caregiverInfo?.emergencyContact || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Charts Section - 3 columns */}
          <div className="space-y-6 lg:col-span-3">
            {/* Speech Clarity Tracker */}
            <SpeechTracker speechData={patientData?.speech_swallowing} />

            {/* Side Effects and Nourishment Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <SideEffectsChart
                medicationData={patientData?.medication_adherence}
              />
              <NeurofilamentCard />
            </div>

            {/* Motor Function Assessment */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium">Motor Function</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium text-gray-700">
                      Gait Metrics
                    </h4>
                    <p className="text-sm text-gray-700">
                      <span className="text-gray-600">Stride Length:</span>{" "}
                      {patientData?.assessments?.motorFunction?.gaitMetrics
                        ?.strideLength || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="text-gray-600">Step Count:</span>{" "}
                      {patientData?.assessments?.motorFunction?.gaitMetrics
                        ?.stepCount || "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium text-gray-700">
                      Muscle Weakness
                    </h4>
                    <p className="text-sm text-gray-700">
                      <span className="text-gray-600">Grip Strength:</span>{" "}
                      {patientData?.assessments?.motorFunction?.muscleWeakness
                        ?.gripStrength || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="text-gray-600">Mobility Test:</span>{" "}
                      {patientData?.assessments?.motorFunction?.muscleWeakness
                        ?.mobilityTest || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Cognitive Health
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-600">Memory Decline:</span>{" "}
                    {patientData?.assessments?.cognitiveHealth?.memoryDecline ||
                      "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-600">Hallucinations:</span>{" "}
                    {patientData?.assessments?.cognitiveHealth
                      ?.hallucinations || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="text-gray-600">Last Assessment:</span>{" "}
                    {patientData?.assessments?.cognitiveHealth
                      ?.last_assessment || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Logs */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm font-medium text-gray-700">
                  SpO2 Saturation
                </span>
                <span className="ml-auto text-lg font-semibold text-gray-900">
                  98%
                </span>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                <span className="text-sm font-medium text-gray-700">
                  Sleep Quality
                </span>
                <span className="ml-auto text-lg font-semibold text-gray-900">
                  {patientData?.sleep_quality || "7h 50m"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <span className="text-sm font-medium text-gray-700">
                  Heart rate
                </span>
                <span className="ml-auto text-lg font-semibold text-gray-900">
                  72 bpm
                </span>
              </div>
            </div>

            {/* Emergency Alert */}
            <div className="rounded-xl bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="font-medium text-red-700">
                  Emergency Alert
                </span>
              </div>
              <p className="text-sm text-red-600">Sudden fall detected!</p>
            </div>

            {/* Assistive Devices */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h3 className="mb-4 font-medium text-gray-900">
                Assistive Devices
              </h3>
              <div className="space-y-2">
                {patientData?.assistive_devices?.map(
                  (device: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                      <span className="text-sm text-gray-700">{device}</span>
                    </div>
                  ),
                ) || (
                  <p className="text-sm text-gray-500">No devices recorded</p>
                )}
              </div>
            </div>

            {/* Liquid Intake Log */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Liquid Intake Log</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  ...
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-gray-700">250 ml</span>
                  </div>
                  <span className="text-gray-600">8:00 am</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-gray-700">200 ml</span>
                  </div>
                  <span className="text-gray-600">10:30 am</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-gray-700">180 ml</span>
                  </div>
                  <span className="text-gray-600">1:00 pm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
