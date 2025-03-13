const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const blockchainRoutes = require("./routes/blockchain");

const app = express();
const PORT = process.env.PORT || 3001;
const PYTHON_SERVER_URL = "http://localhost:5000";

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "clerk-frontend-api"],
  }),
);

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `\n[Express] ${new Date().toISOString()} - ${req.method} ${req.url}`,
  );
  console.log("[Express] Request Details:");
  console.log("- Headers:", JSON.stringify(req.headers, null, 2));
  console.log("- Query:", JSON.stringify(req.query, null, 2));
  console.log("- Body:", JSON.stringify(req.body, null, 2));
  console.log("- IP:", req.ip);
  console.log("- User Agent:", req.get("user-agent"));
  next();
});

// Blockchain routes
app.use("/api/blockchain", blockchainRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  console.log("[Health Check] Responding with healthy status");
  res.json({ status: "healthy" });
});

// Proxy middleware configuration
const proxyOptions = {
  target: PYTHON_SERVER_URL,
  changeOrigin: true,
  pathRewrite: (path) => {
    console.log("\n[Express Proxy] Path Rewrite:");
    console.log("- Original path:", path);

    // Handle assessment requests
    if (path === "/api/assessment") {
      console.log("- Handling assessment request");
      return "/api/assessment";
    }

    // Handle patient data requests
    const patientMatch = path.match(/^\/api\/patient-data\/(.*)/);
    if (patientMatch) {
      const newPath = `/patient/${patientMatch[1]}`;
      console.log("- Rewritten path for patient data:", newPath);
      return newPath;
    }

    // Handle caregiver advice requests
    const adviceMatch = path.match(/^\/api\/caregiver-advice\/(.*)/);
    if (adviceMatch) {
      const newPath = `/patient/${adviceMatch[1]}/advice`;
      console.log("- Rewritten path for caregiver advice:", newPath);
      return newPath;
    }

    console.log("- No path rewrite needed");
    return path;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log("\n[Express Proxy] Outgoing Request:");
    console.log("- Method:", proxyReq.method);
    console.log("- Path:", proxyReq.path);
    console.log("- Headers:", JSON.stringify(proxyReq.getHeaders(), null, 2));
    console.log("- Body:", JSON.stringify(req.body, null, 2));
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log("\n[Express Proxy] Incoming Response:");
    console.log("- Status:", proxyRes.statusCode);
    console.log("- Headers:", JSON.stringify(proxyRes.headers, null, 2));
  },
  onError: (err, req, res) => {
    console.error("\n[Express Proxy] Error:");
    console.error("- Message:", err.message);
    console.error("- Stack:", err.stack);
    console.error("- Request:", {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
    });
    res.status(500).json({
      error: "Proxy error",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  },
};

// Apply proxy middleware to API routes
app.use(
  ["/api/patient-data", "/api/caregiver-advice", "/api/assessment"],
  createProxyMiddleware(proxyOptions),
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("\n[Express] Error Handler:");
  console.error("- Error:", err.message);
  console.error("- Stack:", err.stack);
  console.error("- Request:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
  });
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Proxying requests to Python server at ${PYTHON_SERVER_URL}`);
});
