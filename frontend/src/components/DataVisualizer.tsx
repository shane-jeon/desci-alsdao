import { useEffect, useState } from "react";
import {
  VisualizationData,
  FrequencyAnalysisData,
  ApiResponse,
} from "@/services/api";

interface DataVisualizerProps {
  userId: string;
}

export default function DataVisualizer({ userId }: DataVisualizerProps) {
  const [visualizationData, setVisualizationData] =
    useState<VisualizationData | null>(null);
  const [frequencyData, setFrequencyData] =
    useState<FrequencyAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisualization = async () => {
    try {
      const response = await fetch(`/api/visualization?userId=${userId}`);
      const data: ApiResponse<VisualizationData> = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch visualization data");
      }

      setVisualizationData(data.data);
    } catch (err) {
      console.error("Error fetching visualization:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch visualization data",
      );
    }
  };

  const fetchFrequencyAnalysis = async () => {
    try {
      const response = await fetch(`/api/frequency-analysis?userId=${userId}`);
      const data: ApiResponse<FrequencyAnalysisData> = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch frequency analysis");
      }

      setFrequencyData(data.data);
    } catch (err) {
      console.error("Error fetching frequency analysis:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch frequency analysis",
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([fetchVisualization(), fetchFrequencyAnalysis()]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!visualizationData || !frequencyData) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Motor Function Metrics */}
      <section className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Motor Function Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium">Gait Analysis</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Stride Length:</dt>
                <dd>
                  {visualizationData.metrics.motor_function.gait.strideLength ||
                    "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Step Count:</dt>
                <dd>
                  {visualizationData.metrics.motor_function.gait.stepCount ||
                    "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Fall Frequency:</dt>
                <dd>
                  {visualizationData.metrics.motor_function.gait
                    .fallFrequency || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Muscle Weakness</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Grip Strength:</dt>
                <dd>
                  {visualizationData.metrics.motor_function.muscle_weakness
                    .gripStrength || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Mobility Test:</dt>
                <dd>
                  {visualizationData.metrics.motor_function.muscle_weakness
                    .mobilityTest || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Speech and Cognitive Metrics */}
      <section className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">
          Speech & Cognitive Metrics
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium">Speech Assessment</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Speech Clarity:</dt>
                <dd>
                  {visualizationData.metrics.speech.speechClarity || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Swallowing:</dt>
                <dd>
                  {visualizationData.metrics.speech.swallowingDifficulty ||
                    "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Last Assessment:</dt>
                <dd>
                  {visualizationData.metrics.speech.last_assessment || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Cognitive Health</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Memory:</dt>
                <dd>
                  {visualizationData.metrics.cognitive.memoryDecline || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Hallucinations:</dt>
                <dd>
                  {visualizationData.metrics.cognitive.hallucinations || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Last Assessment:</dt>
                <dd>
                  {visualizationData.metrics.cognitive.last_assessment || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Frequency Analysis */}
      <section className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Frequency Analysis</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium">Symptom Frequency</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Falls:</dt>
                <dd>{frequencyData.symptom_frequency.falls} times</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Missed Medications:</dt>
                <dd>
                  {frequencyData.symptom_frequency.medication_missed} times
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Side Effects:</dt>
                <dd>{frequencyData.symptom_frequency.side_effects} reported</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Emergency Triggers:</dt>
                <dd>
                  {frequencyData.symptom_frequency.emergency_triggers} events
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Last Assessments</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-600">Motor:</dt>
                <dd>
                  {frequencyData.temporal_analysis.assessment_dates
                    .last_motor_assessment || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Speech:</dt>
                <dd>
                  {frequencyData.temporal_analysis.assessment_dates
                    .last_speech_assessment || "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Cognitive:</dt>
                <dd>
                  {frequencyData.temporal_analysis.assessment_dates
                    .last_cognitive_assessment || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Analysis Period: {frequencyData.metadata.data_period}
        </div>
      </section>
    </div>
  );
}
