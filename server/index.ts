import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { type Server } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Global error handler
const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  const status = (err as any).status || (err as any).statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
};

// Improved server startup with better error handling
(async () => {
  try {
    log('Starting server initialization...');

    // Force development mode during active development
    process.env.NODE_ENV = 'development';

    // Register routes first
    const server = await registerRoutes(app);
    app.use(errorHandler);

    // Setup Vite middleware
    log('Setting up Vite middleware...');
    await setupVite(app, server);
    log('Vite middleware setup complete');

    const port = 5000;
    log(`Attempting to bind to port ${port}...`);

    await new Promise<void>((resolve, reject) => {
      server.listen({
        port,
        host: "0.0.0.0",
      })
      .once('listening', () => {
        log(`Server successfully listening on port ${port}`);
        resolve();
      })
      .once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${port} is already in use. Please ensure no other server is running on this port.`));
        } else {
          reject(err);
        }
      });
    });

  } catch (err) {
    log(`Fatal error starting server: ${(err as Error).message}`);
    process.exit(1);
  }
})();
