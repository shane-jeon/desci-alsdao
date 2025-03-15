import { createMocks } from "../utils/test-utils";
import handler from "../../src/pages/api/caregiver-advice/[userId]";
import { getAuth } from "@clerk/nextjs/server";

// Mock Clerk's getAuth
jest.mock("@clerk/nextjs/server", () => ({
  getAuth: jest.fn(),
}));

describe("/api/caregiver-advice/[userId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables for all tests
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3001";
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

  describe("GET requests", () => {
    it("should return 401 when user is not authenticated", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          userId: "test-user-123",
        },
      });

      (getAuth as jest.Mock).mockResolvedValueOnce({ userId: null });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Unauthorized",
      });
    });

    it("should return 401 when userId mismatch", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {
          userId: "test-user-123",
        },
      });

      (getAuth as jest.Mock).mockResolvedValueOnce({
        userId: "different-user",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Unauthorized - User ID mismatch",
      });
    });

    it("should handle successful GET request", async () => {
      const userId = "test-user-123";
      const mockData = {
        advice: [
          {
            category: "daily_care",
            recommendations: ["Recommendation 1", "Recommendation 2"],
          },
        ],
      };

      const { req, res } = createMocks({
        method: "GET",
        query: { userId },
      });

      (getAuth as jest.Mock).mockResolvedValueOnce({ userId });

      // Mock global fetch
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        }),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockData);
    });

    it("should handle backend error", async () => {
      const userId = "test-user-123";
      const { req, res } = createMocks({
        method: "GET",
        query: { userId },
      });

      (getAuth as jest.Mock).mockResolvedValueOnce({ userId });

      // Mock fetch to simulate backend error
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Backend error message"),
        }),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Backend error",
        details: "Backend error message",
        status: 500,
      });
    });
  });

  it("should return 405 for unsupported methods", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { userId: "test-user-123" },
    });

    (getAuth as jest.Mock).mockResolvedValueOnce({ userId: "test-user-123" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Method not allowed",
    });
  });
});
