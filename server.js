const express = require("express");
const multer = require("multer");
const { Potrace } = require("potrace");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter (prevent abuse)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(express.static("public"));
const upload = multer({ dest: "uploads/" });

// File upload + SVG conversion
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const filePath = path.join(__dirname, req.file.path);
  const tracer = new Potrace();

  tracer.loadImage(filePath, (err) => {
    if (err) return res.status(500).send("Error processing image");

    tracer.getSVG((err, svg) => {
      if (err) return res.status(500).send("Error generating SVG");

      fs.unlinkSync(filePath); // delete temp file
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(svg);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
