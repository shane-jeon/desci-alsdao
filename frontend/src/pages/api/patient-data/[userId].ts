import { NextApiRequest, NextApiResponse } from "next";

interface MockResponse {
  ok: boolean;
  status?: number;
  statusText?: string;
  json: () => Promise<unknown>;
}

function log(message: string, data?: Record<string, unknown>) {
  console.log(`[API] patient-data: ${message}`, data ? data : "");
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
  try {
    if (req.method === "GET") {
      return handleGet(req, res);
    } else if (req.method === "POST") {
      return handlePost(req, res);
    }

    // Handle unsupported methods
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    const error = err as Error;
    log("Error processing request:", { message: error.message });
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await mockBackendCall("GET");
    if (!response.ok) {
      return res.status(500).json({
        error: "Backend error",
        details: "Backend error message",
        status: 500,
      });
    }

    const data = await response.json();
    log("Received data from backend:", data as Record<string, unknown>);
    return res.status(200).json(data);
  } catch (err) {
    const error = err as Error;
    log("Error in GET request:", { message: error.message });
    return res.status(500).json({
      error: "Backend error",
      details: "Backend error message",
      status: 500,
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await mockBackendCall("POST");
    if (!response.ok) {
      return res.status(500).json({
        error: "Failed to store patient data",
        details: "Backend error message",
        status: 500,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    const error = err as Error;
    log("Error in POST request:", { message: error.message });
    return res.status(500).json({
      error: "Failed to store patient data",
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

async function mockBackendCall(method: string): Promise<MockResponse> {
  // Simulate different responses based on method
  if (method === "GET") {
    return {
      ok: true,
      json: async () => ({ name: "Test Patient", age: 30 }),
    };
  } else if (method === "POST") {
    return {
      ok: true,
      json: async () => ({
        message: "Data stored successfully",
        txHash: "0xmocktxhash",
        blockchainId: "123",
      }),
    };
  }

  return {
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: async () => ({ error: "Internal Server Error" }),
  };
}
