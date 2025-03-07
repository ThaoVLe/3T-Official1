import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as any).status || (err as any).statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Server error:', err);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Improved sequential port binding
  const startServer = async (port = 5000, maxAttempts = 3) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const currentPort = port + attempt;
      try {
        await new Promise((resolve, reject) => {
          server.listen({
            port: currentPort,
            host: "0.0.0.0",
          })
          .once('listening', () => {
            log(`Server started successfully on port ${currentPort}`);
            resolve(true);
          })
          .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              log(`Port ${currentPort} is in use, trying next port...`);
              resolve(false);
            } else {
              reject(err);
            }
          });
        });

        // If we get here without an error, the server started successfully
        return;
      } catch (err) {
        log(`Error starting server on port ${currentPort}: ${(err as Error).message}`);
        if (attempt === maxAttempts - 1) {
          throw err;
        }
      }
    }

    throw new Error(`Failed to bind to any port after ${maxAttempts} attempts`);
  };

  try {
    await startServer();
  } catch (err) {
    log(`Fatal error starting server: ${(err as Error).message}`);
    process.exit(1);
  }
})();