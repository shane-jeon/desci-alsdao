import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

const debugLog = (context: string, data?: unknown) => {
  console.log(`[API:DBTest:${context}]`, data);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    debugLog("Connecting to MongoDB");
    await connectDB();
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const connectionInfo = {
      status: "success",
      message: `MongoDB is ${
        stateMap[connectionState as keyof typeof stateMap]
      }`,
      details: {
        database: mongoose.connection.db?.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        models: Object.keys(mongoose.models),
        readyState: connectionState,
      },
    };

    debugLog("Connection Info", connectionInfo);
    return res.status(200).json(connectionInfo);
  } catch (error) {
    debugLog("Error", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(500).json({
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to connect to database",
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}
