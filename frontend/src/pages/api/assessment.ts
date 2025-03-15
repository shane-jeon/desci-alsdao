import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const debugLog = (context: string, data?: unknown) => {
  console.log(`[API:Assessment:${context}]`, data);
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
    body: req.method === "POST" ? req.body : undefined,
  });

  try {
    const { userId } = getAuth(req);
    debugLog("Auth", { userId });

    if (!userId) {
      debugLog("Unauthorized", { userId });
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "POST") {
      try {
        const formData = { ...req.body, userId };
        debugLog("Forwarding to backend", { formData });

        // Forward the data to our Express backend
        const response = await fetch(`${BACKEND_URL}/api/assessment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const responseData = await response.json();
        debugLog("Backend response", {
          status: response.status,
          ok: response.ok,
          data: responseData,
        });

        if (!response.ok) {
          debugLog("Backend error", responseData);
          throw new Error(responseData.error || "Failed to save assessment");
        }

        // Update user metadata in Clerk
        try {
          await clerkClient.users.updateUser(userId, {
            publicMetadata: {
              hasCompletedAssessment: true,
            },
          });
          debugLog("Updated user metadata in Clerk");
        } catch (clerkError) {
          debugLog("Error updating Clerk metadata", clerkError);
          // Don't throw here, as the assessment was still saved successfully
        }

        // Return the saved data to the frontend
        return res.status(200).json(responseData);
      } catch (error) {
        debugLog("Error saving assessment", {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Failed to save assessment" });
      }
    }

    if (req.method === "GET") {
      try {
        debugLog("Fetching from backend", { userId });
        // Get the user's assessment data from backend
        const response = await fetch(
          `${BACKEND_URL}/api/patient-data/${userId}`,
        );

        if (!response.ok) {
          const error = await response.json();
          debugLog("Backend error", error);
          throw new Error(error.error || "Failed to fetch assessment");
        }

        const data = await response.json();
        debugLog("Backend response", data);
        return res.status(200).json(data);
      } catch (error) {
        debugLog("Error fetching assessment", {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        });
        return res.status(500).json({ error: "Failed to fetch assessment" });
      }
    }

    debugLog("Method not allowed", { method: req.method });
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    debugLog("Error processing request", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({ error: "Internal server error" });
  }
}
