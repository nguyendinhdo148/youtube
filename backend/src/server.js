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

// CONNECT DB (chạy 1 lần)
connectDB();

// MIDDLEWARE
app.use(express.json());
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(clerkMiddleware());

// ROUTES
app.get("/", (req, res) => {
  res.send("Hello World! 123");
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

// SENTRY
Sentry.setupExpressErrorHandler(app);

// ❌ KHÔNG listen
export default app;
