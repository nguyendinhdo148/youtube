// api/index.js
import app from '../src/server.js';

// Vercel cần export handler function
export default async function handler(req, res) {
  console.log(`[Vercel Handler] ${req.method} ${req.url}`);
  return app(req, res);
}