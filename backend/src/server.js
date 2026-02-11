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

/* =====================
   BASIC MIDDLEWARE
===================== */

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://youtube-fe-dun.vercel.app"
    ],
    credentials: true
  })
);

/* =====================
   ROUTES KHÔNG CẦN AUTH
===================== */

app.get("/", (req, res) => {
  res.send("Hello World! 123");
});

/* =====================
   AUTH MIDDLEWARE
   (SAU CORS)
===================== */

app.use(clerkMiddleware());

/* =====================
   API ROUTES
===================== */

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

/* =====================
   ERROR HANDLER
===================== */

Sentry.setupExpressErrorHandler(app);

/* =====================
   DB CONNECT (SAFE)
===================== */

let isConnected = false;
const initDB = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

app.use(async (req, res, next) => {
  await initDB();
  next();
});

/* =====================
   EXPORT (QUAN TRỌNG)
===================== */

export default app;
