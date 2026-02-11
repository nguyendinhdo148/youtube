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

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // req.auth will be available in the request object

app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Backend API is running!",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/inngest",
      "/api/chat",
      "/debug-sentry"
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV
  });
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

Sentry.setupExpressErrorHandler(app);

// QUAN TRỌNG: Khởi tạo database và start server
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");
    
    // Chỉ listen port khi chạy local
    if (ENV.NODE_ENV !== 'production') {
      app.listen(ENV.PORT, () => {
        console.log(`🚀 Server started locally on port: ${ENV.PORT}`);
      });
    } else {
      console.log("✅ Server ready for Vercel serverless environment");
    }
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

// Gọi startServer ngay lập tức
startServer();

// QUAN TRỌNG: Export app cho Vercel
export default app;