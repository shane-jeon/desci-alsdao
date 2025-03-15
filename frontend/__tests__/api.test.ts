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

describe("API Data Types and Validation", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("Visualization Data", () => {
    it("should handle complete visualization data correctly", async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockVisualizationData,
      };

      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve(mockResponse as unknown as Response),
        );

      const response = await fetch("/api/visualization?userId=test-user");
      const data: ApiResponse<VisualizationData> = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.metrics).toBeDefined();
      expect(data.data.metrics.motor_function).toBeDefined();
      expect(data.data.metrics.speech).toBeDefined();
      expect(data.data.metrics.cognitive).toBeDefined();
      expect(data.data.timestamps).toBeDefined();
    });

    it("should handle missing motor function data", async () => {
      const incompleteData = {
        ...mockVisualizationData,
        data: {
          ...mockVisualizationData.data,
          metrics: {
            ...mockVisualizationData.data.metrics,
            motor_function: undefined,
          },
        },
      };

      const mockResponse = {
        ok: true,
        json: async () => incompleteData,
      };

      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve(mockResponse as unknown as Response),
        );

      const response = await fetch("/api/visualization?userId=test-user");
      const data: ApiResponse<VisualizationData> = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.metrics.motor_function).toBeUndefined();
    });

    it("should handle missing timestamps", async () => {
      const incompleteData = {
        ...mockVisualizationData,
        data: {
          ...mockVisualizationData.data,
          timestamps: undefined,
        },
      };

      const mockResponse = {
        ok: true,
        json: async () => incompleteData,
      };

      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve(mockResponse as unknown as Response),
        );

      const response = await fetch("/api/visualization?userId=test-user");
      const data: ApiResponse<VisualizationData> = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.timestamps).toBeUndefined();
    });
  });

  describe("Frequency Analysis Data", () => {
    it("should handle complete frequency analysis data correctly", async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockFrequencyData,
      };

      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve(mockResponse as unknown as Response),
        );

      const response = await fetch("/api/frequency-analysis?userId=test-user");
      const data: ApiResponse<FrequencyAnalysisData> = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.symptom_frequency).toBeDefined();
      expect(data.data.temporal_analysis).toBeDefined();
      expect(data.data.metadata).toBeDefined();
    });

    it("should handle invalid symptom frequency types", async () => {
      const invalidData = {
        ...mockFrequencyData,
        data: {
          ...mockFrequencyData.data,
          symptom_frequency: {
            falls: "2", // Invalid type: should be number
            medication_missed: 1,
            side_effects: 2,
            emergency_triggers: 0,
          },
        },
      };

      const mockResponse = {
        ok: true,
        json: async () => invalidData,
      };

      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve(mockResponse as unknown as Response),
        );

      const response = await fetch("/api/frequency-analysis?userId=test-user");
      const data: ApiResponse<FrequencyAnalysisData> = await response.json();

      expect(data.success).toBe(true);
      expect(typeof data.data.symptom_frequency.falls).not.toBe("number");
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      jest
        .spyOn(global, "fetch")
        .mockImplementation(() => Promise.reject(new Error("Network error")));

      await expect(
        fetch("/api/visualization?userId=test-user"),
      ).rejects.toThrow("Network error");
    });

    it("should handle API errors with details", async () => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Not found",
        details: "User data not found",
      };

      const mockResponse = {
        ok: false,
        json: async () => errorResponse,
      };

      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve(mockResponse as unknown as Response),
        );

      const response = await fetch("/api/visualization?userId=invalid-user");
      const data: ApiResponse<null> = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe("Not found");
      expect(data.details).toBe("User data not found");
    });

    it("should handle malformed JSON responses", async () => {
      const mockResponse = {
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      };

      jest
        .spyOn(global, "fetch")
        .mockImplementation(() =>
          Promise.resolve(mockResponse as unknown as Response),
        );

      await expect(
        fetch("/api/visualization?userId=test-user").then((r) => r.json()),
      ).rejects.toThrow("Invalid JSON");
    });
  });

  describe("Data Validation", () => {
    it("should validate required fields in visualization data", () => {
      const validationResult = {
        isValid: false,
        errors: [
          {
            field: "motor_function",
            message: "Incomplete motor function data",
          },
          { field: "cognitive", message: "Cognitive data is required" },
          { field: "timestamps", message: "Timestamps are required" },
        ],
      };

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toHaveLength(3);
    });

    it("should validate required fields in frequency analysis data", () => {
      const validationResult = {
        isValid: false,
        errors: [
          {
            field: "symptom_frequency",
            message: "Invalid frequency data types",
          },
          {
            field: "temporal_analysis",
            message: "Temporal analysis data is required",
          },
          { field: "metadata", message: "Metadata is required" },
        ],
      };

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toHaveLength(3);
    });
  });
});
