import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  VisualizationData,
  FrequencyAnalysisData,
  ApiResponse,
} from "@/services/api";

const mockVisualizationData: ApiResponse<VisualizationData> = {
  success: true,
  data: {
    metrics: {
      motor_function: {
        gait: {
          strideLength: "120",
          stepCount: "5000",
          fallFrequency: "2",
        },
        muscle_weakness: {
          gripStrength: "40",
          mobilityTest: "3/5",
        },
      },
      speech: {
        speechClarity: "moderate",
        swallowingDifficulty: "mild",
        facialControl: "good",
        last_assessment: "2024-03-15",
      },
      cognitive: {
        memoryDecline: "mild",
        hallucinations: "none",
        last_assessment: "2024-03-15",
      },
      medication: {
        missed_doses: 1,
        side_effects: ["nausea", "fatigue"],
        adherence: "good",
      },
    },
    timestamps: {
      last_updated: "2024-03-15T10:00:00Z",
      data_collected: "2024-03-15T09:00:00Z",
    },
  },
};

const mockFrequencyData: ApiResponse<FrequencyAnalysisData> = {
  success: true,
  data: {
    symptom_frequency: {
      falls: 2,
      medication_missed: 1,
      side_effects: 2,
      emergency_triggers: 0,
    },
    temporal_analysis: {
      assessment_dates: {
        last_motor_assessment: "2024-03-15",
        last_speech_assessment: "2024-03-14",
        last_cognitive_assessment: "2024-03-13",
      },
    },
    metadata: {
      analysis_timestamp: "2024-03-15T10:00:00Z",
      data_period: "last 30 days",
    },
  },
};

describe("API Data Types", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should handle visualization data correctly", async () => {
    const mockResponse = {
      ok: true,
      json: async () => mockVisualizationData,
    } as unknown as Response;

    jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve(mockResponse));

    const response = await fetch("/api/visualization?userId=test-user");
    const data: ApiResponse<VisualizationData> = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.metrics).toBeDefined();
    expect(data.data.metrics.motor_function).toBeDefined();
    expect(data.data.metrics.speech).toBeDefined();
    expect(data.data.metrics.cognitive).toBeDefined();
    expect(data.data.timestamps).toBeDefined();
  });

  it("should handle frequency analysis data correctly", async () => {
    const mockResponse = {
      ok: true,
      json: async () => mockFrequencyData,
    } as unknown as Response;

    jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve(mockResponse));

    const response = await fetch("/api/frequency-analysis?userId=test-user");
    const data: ApiResponse<FrequencyAnalysisData> = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.symptom_frequency).toBeDefined();
    expect(data.data.temporal_analysis).toBeDefined();
    expect(data.data.metadata).toBeDefined();
  });

  it("should handle error responses correctly", async () => {
    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Not found",
      details: "User data not found",
    };

    const mockResponse = {
      ok: false,
      json: async () => errorResponse,
    } as unknown as Response;

    jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve(mockResponse));

    const response = await fetch("/api/visualization?userId=invalid-user");
    const data: ApiResponse<null> = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.details).toBeDefined();
  });
});
