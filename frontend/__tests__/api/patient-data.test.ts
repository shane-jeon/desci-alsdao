import { createMocks } from "../utils/test-utils";
import handler from "../../src/pages/api/patient-data/[userId]";
import { getAuth } from "@clerk/nextjs/server";

// Mock Clerk's getAuth
jest.mock("@clerk/nextjs/server", () => ({
  getAuth: jest.fn(),
}));

// Mock ethers
jest.mock("ethers", () => {
  const originalModule = jest.requireActual("ethers");
  const mockWait = jest.fn().mockResolvedValue({});
  const mockTx = { wait: mockWait, hash: "0xmocktxhash" };
  const mockStorePatientData = jest.fn().mockResolvedValue(mockTx);

  return {
    ...originalModule,
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
    })),
    Contract: jest.fn().mockImplementation(() => ({
      storePatientData: mockStorePatientData,
    })),
    Wallet: jest.fn().mockImplementation(() => ({
      provider: {},
      getAddress: jest.fn().mockResolvedValue("0xmockaddress"),
    })),
  };
});

describe("/api/patient-data/[userId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables for all tests
    process.env.NEXT_PUBLIC_RPC_URL = "http://localhost:8545";
    process.env.PRIVATE_KEY =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS =
      "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3001";
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_RPC_URL;
    delete process.env.PRIVATE_KEY;
    delete process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
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
      const mockData = { name: "Test Patient", age: 30 };

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

  describe("POST requests", () => {
    const mockPatientData = {
      demographics: { age: 30 },
      medical_history: { conditions: [] },
      motor_function: { status: "good" },
      speech_swallowing: { status: "normal" },
      respiratory_sleep: { status: "normal" },
      cognitive_health: { status: "good" },
    };

    it("should handle successful POST request", async () => {
      const userId = "test-user-123";
      const { req, res } = createMocks({
        method: "POST",
        query: { userId },
        body: { patientData: mockPatientData },
      });

      (getAuth as jest.Mock).mockResolvedValueOnce({ userId });

      // Mock successful backend response
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        }),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        message: "Data stored successfully",
        txHash: "0xmocktxhash",
        blockchainId: expect.any(String),
      });
    });

    it("should handle backend error in POST request", async () => {
      const userId = "test-user-123";
      const { req, res } = createMocks({
        method: "POST",
        query: { userId },
        body: { patientData: mockPatientData },
      });

      (getAuth as jest.Mock).mockResolvedValueOnce({ userId });

      // Mock backend error
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Backend error" }),
        }),
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toHaveProperty(
        "error",
        "Failed to store patient data",
      );
    });
  });

  it("should return 405 for unsupported methods", async () => {
    const { req, res } = createMocks({
      method: "PUT",
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
