import { NextApiRequest, NextApiResponse } from "next";
import { CaregiverAdvice } from "@/services/api";

const mockData = {
  advice: [
    {
      category: "daily_care",
      recommendations: ["Recommendation 1", "Recommendation 2"],
    },
  ],
};

function log(message: string, data?: Record<string, unknown>) {
  console.log(`[API] caregiver-advice: ${message}`, data ? data : "");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  log("Received request", {
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers,
  });

  // Extract userId from query
  const { userId } = req.query;
  log(`Extracted userId from query: ${userId}`);

  // Mock auth check
  const authResult = await mockAuthCheck(userId as string);
  log(`Auth result:`, authResult);

  // Check if user is authenticated
  if (!authResult.isAuthenticated) {
    log("No authenticated user found");
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // Check if user has access to requested data
  if (authResult.userId !== userId) {
    log("User ID mismatch");
    return res.status(401).json({
      error: "Unauthorized - User ID mismatch",
    });
  }

  // Handle different HTTP methods
  if (req.method === "GET") {
    log("Processing GET request");
    return handleGet(req, res);
  } else if (req.method === "POST") {
    log("Processing POST request");
    return handlePost(req, res);
  }

  // Handle unsupported methods
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Return mock data
    return res.status(200).json(mockData);
  } catch (err) {
    const error = err as Error;
    log("Error processing GET request:", { message: error.message });
    return res.status(500).json({
      error: "Backend error",
      details: "Backend error message",
      status: 500,
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await mockBackendCall();
    if (!response.ok) {
      log("Backend request failed:", {
        status: response.status,
        statusText: response.statusText,
      });
      return res.status(500).json({
        error: "Backend error",
        details: "Backend error message",
        status: 500,
      });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    const error = err as Error;
    log("Error in POST request:", { message: error.message });
    return res.status(500).json({
      error: "Backend error",
      details: "Backend error message",
      status: 500,
    });
  }
}

// Mock functions
async function mockAuthCheck(userId: string) {
  // Simulate different auth scenarios for testing
  if (userId === "test-user-123") {
    return { userId: "test-user-123", isAuthenticated: true };
  } else if (userId === "different-user") {
    return { userId: "different-user", isAuthenticated: true };
  }
  return { userId: null, isAuthenticated: false };
}

interface MockResponse {
  ok: boolean;
  status?: number;
  statusText?: string;
}

async function mockBackendCall(): Promise<MockResponse> {
  // Simulate a backend call
  return {
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
  };
}
