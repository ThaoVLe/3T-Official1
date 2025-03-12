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

// Improved server startup with better error handling and port management
const startServer = async (port: number, retries = 3): Promise<void> => {
  try {
    log(`Starting server initialization (PID: ${process.pid})...`);

    // Force development mode during active development
    process.env.NODE_ENV = 'development';

    // Register routes first
    const server = await registerRoutes(app);
    app.use(errorHandler);

    // Setup Vite middleware
    log('Setting up Vite middleware...');
    await setupVite(app, server);
    log('Vite middleware setup complete');

    log(`Attempting to bind to port ${port}...`);

    return new Promise((resolve, reject) => {
      const onError = (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          if (retries > 0) {
            log(`Port ${port} is in use, trying port ${port + 1}...`);
            server.close();
            startServer(port + 1, retries - 1).then(resolve).catch(reject);
          } else {
            reject(new Error(`Could not find an available port after ${3 - retries} attempts`));
          }
        } else {
          reject(err);
        }
      };

      server.once('error', onError);

      server.listen({
        port,
        host: "0.0.0.0",
      }, () => {
        const actualPort = (server.address() as any).port;
        log(`Server successfully listening on port ${actualPort} (PID: ${process.pid})`);
        server.removeListener('error', onError);
        resolve();
      });
    });
  } catch (err) {
    log(`Error during server startup: ${(err as Error).message}`);
    throw err;
  }
};

// Start the server with automatic port selection
(async () => {
  try {
    await startServer(5000);
  } catch (err) {
    log(`Fatal error starting server: ${(err as Error).message}`);
    process.exit(1);
  }
})();