import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createSession } from "./queueEngine";
import { registerHandlers } from "./socketHandlers";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  QueueState,
} from "./types";

// ─── App bootstrap ────────────────────────────────────────────────────────────

const app = express();
const httpServer = http.createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow localhost during dev + CLIENT_URL from env in production

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ─── Socket.io server ─────────────────────────────────────────────────────────

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ─── In-memory queue state ────────────────────────────────────────────────────

const stateRef: { current: QueueState } = {
  current: createSession(),
};

// ─── REST endpoints ───────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    patients: stateRef.current.patients.length,
    sessionId: stateRef.current.session.id,
  });
});

app.post("/reset", (_req, res) => {
  stateRef.current = createSession();
  const { getQueueStats } = require("./queueEngine");
  const stats = getQueueStats(stateRef.current);
  io.emit("queue:sync", { ...stateRef.current, stats });
  res.json({ success: true, message: "Session reset. Fresh queue started." });
});

// ─── Socket.io connection ─────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);
  registerHandlers(io, socket, stateRef);
});

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? "4000", 10);

httpServer.listen(PORT, () => {
  console.log(`\n🚀 QueueCure+ backend running`);
  console.log(`   Port     : ${PORT}`);
  console.log(`   Allowed  : ${allowedOrigins.join(", ")}`);
  console.log(`   Health   : http://localhost:${PORT}/health\n`);
});
