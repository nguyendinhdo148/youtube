import "../instrument.mjs";
import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { functions, inngest } from "./config/inngest.js";
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.route.js";
import cors from "cors";
import * as Sentry from "@sentry/node";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Backend API is running!",
    timestamp: new Date().toISOString(),
    nodeEnv: ENV.NODE_ENV
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Not Found", 
    path: req.originalUrl,
    method: req.method 
  });
});

// Error handling
Sentry.setupExpressErrorHandler(app);

// Kết nối database (chỉ một lần)
let isDbConnected = false;

const initApp = async () => {
  if (!isDbConnected) {
    try {
      await connectDB();
      console.log("✅ Database connected");
      isDbConnected = true;
    } catch (error) {
      console.error("❌ Database connection failed:", error);
    }
  }
  return app;
};

// Khởi tạo app
const appPromise = initApp();

// Export cho Vercel
export default async function handler(req, res) {
  const expressApp = await appPromise;
  return expressApp(req, res);
}

// Chỉ chạy server local khi development
if (process.env.NODE_ENV === 'development') {
  const PORT = ENV.PORT || 3000;
  appPromise.then(app => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running locally on port ${PORT}`);
    });
  });
}