// api/test.js
export default function handler(req, res) {
  res.json({ 
    success: true, 
    message: "Test endpoint is working",
    path: req.url,
    timestamp: new Date().toISOString()
  });
}