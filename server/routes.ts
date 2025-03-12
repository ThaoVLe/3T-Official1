import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertEntrySchema, insertUserSchema } from "@shared/schema";
import express from 'express';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }

      // Convert email to lowercase
      const email = result.data.email.toLowerCase();
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Create new user if they don't exist
        user = await storage.createUser({ ...result.data, email });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Failed to process login" });
    }
  });

  // Diary entry routes
  app.get("/api/entries", async (req, res) => {
    try {
      const email = (req.query.email as string)?.toLowerCase();
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Extract filter parameters
      const feeling = req.query.feeling as string;
      const location = req.query.location as string;
      const tag = req.query.tag as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Build filter object
      const filters: any = {};
      if (feeling) filters.feeling = feeling;
      if (location) filters.location = location;
      if (tag) filters.tags = tag;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      // Get entries with optional filters
      const entries = await storage.getAllEntriesByEmail(email, filters);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.post("/api/entries", async (req, res) => {
    try {
      console.log("Received entry data:", req.body);

      const result = insertEntrySchema.safeParse(req.body);
      if (!result.success) {
        console.error("Validation errors:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid entry data", 
          errors: result.error.errors 
        });
      }

      // Ensure email is lowercase and using the correct field name
      const entryData = {
        userEmail: result.data.userEmail.toLowerCase(),
        content: result.data.content
      };

      console.log("Creating entry with data:", entryData);
      const entry = await storage.createEntry(entryData);
      console.log("Entry created successfully:", entry);

      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating entry:", error);
      res.status(500).json({ 
        message: "Failed to create entry",
        error: error instanceof Error ? error.message : String(error)
      });
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

      // Ensure email is lowercase if it's being updated
      const updateData = {
        ...result.data,
        userEmail: result.data.userEmail?.toLowerCase()
      };

      const entry = await storage.updateEntry(parseInt(req.params.id), updateData);
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
        return res.status(500).json({ message: "Server error while uploading file" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}