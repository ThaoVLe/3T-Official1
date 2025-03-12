import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertEntrySchema, insertCommentSchema } from "@shared/schema";
import express from 'express';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Update video MIME types support
const validVideoTypes = [
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
  'video/webm',
  'video/3gpp',
  'video/x-matroska',
  'video/mov'  // Add explicit MOV support
];

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/heic',
      'image/heif'
    ];

    const allowedTypes = [...validImageTypes, ...validVideoTypes];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Please upload an image or video file.'));
      return;
    }

    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));
  
  // Add a health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      headers: req.headers
    });
  });
  
  // Diagnostic route to check client routing
  app.get('/debug', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Debug Page</title>
        </head>
        <body>
          <h1>Debug Page</h1>
          <p>If you can see this, your server is running correctly.</p>
          <p>Current time: ${new Date().toISOString()}</p>
          <p>Try accessing: <a href="/">Home Page</a></p>
        </body>
      </html>
    `);
  });

  app.get("/api/entries", async (req, res) => {
    try {
      // Add headers to prevent caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Expires', '0');
      res.setHeader('Pragma', 'no-cache');
      
      // Get all entries without filtering by userId (for testing)
      const entries = await storage.getAllEntries();
      console.log("Fetched entries from database:", entries);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/:id", async (req, res) => {
    try {
      const entry = await storage.getEntry(parseInt(req.params.id));
      if (!entry) return res.status(404).json({ message: "Entry not found" });
      res.json(entry);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    try {
      const result = insertEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid entry data", 
          errors: result.error.errors 
        });
      }
      const entry = await storage.createEntry(result.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating entry:", error);
      res.status(500).json({ message: "Failed to create entry" });
    }
  });

  app.put("/api/entries/:id", async (req, res) => {
    try {
      const result = insertEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid entry data", 
          errors: result.error.errors 
        });
      }
      const entry = await storage.updateEntry(parseInt(req.params.id), result.data);
      if (!entry) return res.status(404).json({ message: "Entry not found" });
      res.json(entry);
    } catch (error) {
      console.error("Error updating entry:", error);
      res.status(500).json({ message: "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", async (req, res) => {
    try {
      const success = await storage.deleteEntry(parseInt(req.params.id));
      if (!success) return res.status(404).json({ message: "Entry not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Media upload endpoint with error handling
  app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File is too large. Maximum size is 50MB" });
        }
        return res.status(400).json({ message: "Error uploading file" });
      } else if (err) {
        if (err.message === 'Invalid file type') {
          return res.status(400).json({ message: "Invalid file type. Please upload an image or video file." });
        }
        return res.status(500).json({ message: "Server error while uploading file" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    });
  });

  // Comment routes
  app.get("/api/entries/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(parseInt(req.params.id));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/entries/:id/comments", async (req, res) => {
    try {
      const result = insertCommentSchema.safeParse({
        entryId: parseInt(req.params.id),
        content: req.body.content
      });

      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid comment data", 
          errors: result.error.errors 
        });
      }

      const comment = await storage.addComment(result.data);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/entries/:id/comments/:commentId", async (req, res) => {
    try {
      const success = await storage.deleteComment(parseInt(req.params.commentId));
      if (!success) return res.status(404).json({ message: "Comment not found" });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}