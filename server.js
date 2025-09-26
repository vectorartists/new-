// Backend for Vectorizee (Free Vectorizer)
// Requires: Node.js v18+
// Install deps: npm install
// Run server: npm start
// Visit: http://localhost:3000

const express = require("express");
const multer = require("multer");
const path = require("path");
const { trace } = require("potrace");
const sharp = require("sharp");
const cors = require("cors");
const rateLimit = require("rate-limit-express");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow frontend to access backend
app.use(cors());

// Serve static files from "public" folder (index.html, app.js, styles.css)
app.use(express.static(path.join(__dirname, "public")));

// Basic rate limiting to avoid abuse
app.use(
  rateLimit({
    window: 60 * 1000, // 1 minute
    limit: 30,         // max 30 requests/minute/IP
  })
);

// Multer config: keep uploaded files in memory only (no saving to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // max 8MB
});

// API: /api/vectorize
// Takes an uploaded image and returns an SVG string
app.post("/api/vectorize", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Convert image buffer to PNG to normalize for potrace
    const pngBuffer = await sharp(req.file.buffer)
      .ensureAlpha()
      .png()
      .toBuffer();

    // Use potrace to trace image into SVG
    trace(
      pngBuffer,
      {
        color: "black",
        background: "transparent",
        optTolerance: 0.4, // detail level
      },
      (err, svg) => {
        if (err) {
          console.error("Potrace error:", err);
          return res.status(500).json({ error: "Vectorization failed" });
        }

        // Send back SVG as JSON
        res.json({ svg });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
