import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/als-dao";

export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("[MongoDB] Already connected");
      return;
    }

    console.log("[MongoDB] Connecting to database...");
    await mongoose.connect(MONGODB_URI, {
      // These options are to handle deprecation warnings
      retryWrites: true,
      w: "majority",
    });

    console.log("[MongoDB] Connected successfully");

    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("[MongoDB] Disconnected from database");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("[MongoDB] Connection closed due to application termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    throw error;
  }
}

export function getConnectionStatus() {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}
