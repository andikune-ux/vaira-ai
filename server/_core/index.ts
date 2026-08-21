import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { attachWebRtcSignaling } from "./webrtc-signaling";
import { getIceServerConfig } from "./webrtc-config";
import { sdk } from "./sdk";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  await attachWebRtcSignaling(server);

  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "https://vairaiapp-n9sw5cvx.manus.space")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const isAllowedBrowserOrigin = (origin: string) => {
    if (configuredOrigins.includes(origin)) return true;
    return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin)
      || /^https:\/\/(?:8081|3000)-[a-z0-9-]+\.sg1\.manus\.computer$/.test(origin);
  };

  // Native APK tidak mengirim Origin. Browser hanya menerima CORS dari aplikasi/preview yang disetujui.
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isAllowedBrowserOrigin(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-AiraX-Session",
    );
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      if (origin && !isAllowedBrowserOrigin(origin)) {
        res.sendStatus(403);
        return;
      }
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.get("/api/health/primary-config", (_req, res) => {
    res.json({
      ok: true,
      source: "legacy-primary",
      mode: "manual",
      configured: Boolean(process.env.PRIMARY_DATABASE_URL?.trim()),
      backupConfigured: Boolean(process.env.SERVER_DATABASE_2_URL?.trim()),
    });
  });

  app.get("/api/webrtc/config", async (req, res) => {
    try {
      await sdk.authenticateRequest(req);
      res.json({ iceServers: getIceServerConfig() });
    } catch {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
