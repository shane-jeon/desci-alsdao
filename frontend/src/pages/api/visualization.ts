import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const debugLog = (context: string, data?: unknown) => {
  console.log(`[API:Visualization:${context}]`, data);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  debugLog("Request", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
  });

  try {
    const { userId } = getAuth(req);
    debugLog("Auth", { userId });

    if (!userId) {
      debugLog("Unauthorized", { userId });
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "GET") {
      debugLog("Method not allowed", { method: req.method });
      return res.status(405).json({ error: "Method not allowed" });
    }

    debugLog("Forwarding to backend", { userId });

    // Forward the request to the Python backend
    const response = await fetch(
      `${BACKEND_URL}/api/visualization?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    debugLog("Backend response", {
      status: response.status,
      ok: response.ok,
      data,
    });

    if (!response.ok) {
      debugLog("Backend error", data);
      throw new Error(data.error || "Failed to fetch visualization data");
    }

    return res.status(200).json(data);
  } catch (error) {
    debugLog("Error", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
