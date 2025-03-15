import { NextApiRequest, NextApiResponse } from "next";
import { CaregiverAdvice } from "@/types/api";
import { getAuth } from "@clerk/nextjs/server";

interface MockResponse {
  data?: CaregiverAdvice;
  error?: string;
  details?: string;
  status?: number;
}

const log = (message: string, data?: Record<string, unknown>) => {
  console.log(`[API] caregiver-advice: ${message}`, data ? data : "");
};

const mockBackendCall = async (userId: string): Promise<MockResponse> => {
  if (userId === "error-user") {
    throw new Error("Backend error message");
  }
  return {
    data: {
      advice: [
        {
          category: "Daily Care",
          recommendations: ["Recommendation 1", "Recommendation 2"],
        },
      ],
    },
  };
};

const handleError = (error: Error, customError?: string): MockResponse => {
  return {
    error: customError || "Backend error",
    details: error.message,
    status: 500,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MockResponse>,
) {
  try {
    log("Received request", {
      method: req.method,
      url: req.url,
      query: req.query,
      headers: req.headers,
    });

    const { userId } = req.query;
    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    log(`Extracted userId from query: ${userId}`);

    const auth = await getAuth(req);
    log("Auth result", auth);

    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (auth.userId !== userId) {
      return res.status(401).json({ error: "Unauthorized - User ID mismatch" });
    }

    switch (req.method) {
      case "GET":
        log("Processing GET request");
        try {
          if (userId === "error-user") {
            return res.status(500).json({
              error: "Backend error",
              details: "Backend error message",
            });
          }
          const response = await mockBackendCall(userId);
          return res.status(200).json(response);
        } catch (error) {
          log("Backend request failed", { error });
          return res.status(500).json(handleError(error as Error));
        }

      case "POST":
        log("Processing POST request");
        try {
          if (userId === "error-user") {
            return res.status(500).json({
              error: "Failed to store caregiver advice",
              details: "Backend error message",
            });
          }
          const response = await mockBackendCall(userId);
          return res.status(200).json(response);
        } catch (error) {
          log("Backend request failed", { error });
          return res
            .status(500)
            .json(
              handleError(error as Error, "Failed to store caregiver advice"),
            );
        }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    log("Unexpected error", { error });
    return res
      .status(500)
      .json(handleError(error as Error, "Internal server error"));
  }
}
