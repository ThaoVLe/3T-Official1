import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertEntrySchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Media upload endpoint
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // In a real app, we'd store the file and return a URL
    // For this demo, we'll return a fake URL
    res.json({ url: `https://fake-storage/${req.file.originalname}` });
  });

  const httpServer = createServer(app);
  return httpServer;
}
