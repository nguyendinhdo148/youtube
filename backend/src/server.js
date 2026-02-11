import "../instrument.mjs";
import express from "express";
import cors from "cors";
import * as Sentry from "@sentry/node";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { functions, inngest } from "./config/inngest.js";
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.route.js";

const app = express();

/* =======================
   MIDDLEWARE
======================= */

app.use(express.json());

const allowedOrigins = [
  "https://youtube-fe-dun.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ]
  })
);

// ⚠️ BẮT BUỘC cho preflight
app.options("*", cors());

// Clerk PHẢI nằm sau CORS
app.use(clerkMiddleware());

/* =======================
   ROUTES
======================= */

app.get("/", (req, res) => {
  res.send("Hello World! 123");
});

app.get("/debug-sentry", () => {
  throw new Error("My first Sentry error!");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

/* =======================
   ERROR HANDLER
======================= */

Sentry.setupExpressErrorHandler(app);

/* =======================
   START SERVER
======================= */

const startServer = async () => {
  try {
    await connectDB();

    // ⚠️ Vercel KHÔNG cần listen
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log("Server running on port:", ENV.PORT);
      });
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
