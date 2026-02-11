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

// Configure CORS with a safe allowlist and preflight handling
const allowedOrigins = [
  ENV.CLIENT_URL,
  // add any deployed frontend hostnames you use here
  "https://youtube-fe-kohl.vercel.app",
];
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like server-to-server or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
};

// apply CORS and ensure OPTIONS preflight is handled for all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Clerk middleware (keeps req.auth available)
app.use(clerkMiddleware());

app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

app.get("/", (req, res) => {
  res.send("Hello World! 123");
});

// mount inngest and chat routes
app.use("/api/inngest", serve({ client: inngest, functions }));

// keep original /api/chat
app.use("/api/chat", chatRoutes);

// also mount /chat as an alias (some deployments/frontend may omit /api)
app.use("/chat", chatRoutes);

Sentry.setupExpressErrorHandler(app);

const startServer = async () => {
  try {
    await connectDB();
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log("Server started on port:", ENV.PORT);
      });
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

startServer();

export default app;
