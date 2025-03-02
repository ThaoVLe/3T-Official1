import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertEntrySchema } from "@shared/schema";
import express from 'express';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Update multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/heic',
      'image/heif'
    ];

    const validVideoTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-m4v',
      'video/webm',
      'video/3gpp',
      'video/x-matroska'
    ];

    const validAudioTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/ogg'
    ];

    const allowedTypes = [...validImageTypes, ...validVideoTypes, ...validAudioTypes];

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Please upload an image, video, or audio file.'));
      return;
    }

    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  app.get("/api/entries", async (req, res) => {
    const entries = await storage.getAllEntries();
    res.json(entries);
  });

  app.get("/api/entries/:id", async (req, res) => {
    const entry = await storage.getEntry(parseInt(req.params.id));
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  });

  app.post("/api/entries", async (req, res) => {
    const result = insertEntrySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid entry data" });
    }
    const entry = await storage.createEntry(result.data);
    res.status(201).json(entry);
  });

  app.put("/api/entries/:id", async (req, res) => {
    const result = insertEntrySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid entry data" });
    }
    const entry = await storage.updateEntry(parseInt(req.params.id), result.data);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  });

  app.delete("/api/entries/:id", async (req, res) => {
    const success = await storage.deleteEntry(parseInt(req.params.id));
    if (!success) return res.status(404).json({ message: "Entry not found" });
    res.status(204).send();
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
          return res.status(400).json({ message: "Invalid file type. Please upload an image, video, or audio file." });
        }
        return res.status(500).json({ message: "Server error while uploading file" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the URL that can be used to access the file
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}