import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const UPLOADS_DIR = path.join(process.cwd(), ".uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Setup multer for large file uploads (memory or disk, let's use disk for reliability)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.body.sessionId || "default";
    const sessionDir = path.join(UPLOADS_DIR, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    cb(null, sessionDir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename, but sanitize
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, sanitized);
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Relay Fallback - Upload files
  app.post("/api/upload", upload.array("files"), (req, res) => {
    const sessionId = req.body.sessionId;
    if (!sessionId) {
      return res.status(400).json({ error: "No sessionId provided" });
    }
    
    // Simulate Netlify Function / Cloudflare R2 delay & success
    res.json({ 
      success: true, 
      sessionId, 
      filesSaved: req.files?.length || 0 
    });
  });

  // Relay Fallback - List files for a session
  app.get("/api/session/:id", (req, res) => {
    const sessionId = req.params.id;
    const sessionDir = path.join(UPLOADS_DIR, sessionId);
    
    if (!fs.existsSync(sessionDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(sessionDir).map((filename) => {
      const stats = fs.statSync(path.join(sessionDir, filename));
      return {
        name: filename,
        size: stats.size,
      };
    });

    res.json({ files });
  });

  // Relay Fallback - Download file
  app.get("/api/download/:id/:filename", (req, res) => {
    const { id, filename } = req.params;
    const filePath = path.join(UPLOADS_DIR, id, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    res.download(filePath, filename);
  });

  // cleanup task for 48h rules (simplified simple interval for demo)
  setInterval(() => {
    // In a real app this would be a CRON job.
    // For demo purposes, we will not delete them immediately.
  }, 1000 * 60 * 60);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
