import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Serve static files from the React app
  const clientDistPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../dist/public')
    : path.join(__dirname, '../client');
  app.use(express.static(clientDistPath));


  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // The "catch all" handler: for any request that doesn't
  // match one above, send back the index.html file.
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }

    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve on port 5000 first, then fall back to other ports
  const tryListen = (port = 5000, maxAttempts = 3) => {
    const tryPort = (attempt = 0) => {
      if (attempt >= maxAttempts) {
        log(`Failed to bind to any port after ${maxAttempts} attempts`);
        process.exit(1);
        return;
      }

      const currentPort = port + attempt;
      server.listen({
        port: currentPort,
        host: "0.0.0.0",
      }, () => {
        log(`Server started successfully on port ${currentPort}`);
        console.log(`Server is accessible at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${currentPort} is busy, trying next port...`);
          tryPort(attempt + 1);
        } else {
          log(`Error starting server: ${err.message}`);
          throw err;
        }
      });
    };

    tryPort();
  };

  tryListen();
})();