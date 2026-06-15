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
// During development: allow all origins.
// In production (Render): we'll lock this to the Vercel frontend URL via env var.

const ALLOWED_ORIGIN = process.env.FRONTEND_URL ?? "*";

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ─── Socket.io server ─────────────────────────────────────────────────────────

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
  // Reconnection transport: polling fallback before websocket upgrade
  transports: ["websocket", "polling"],
});

// ─── In-memory queue state ────────────────────────────────────────────────────
// Single mutable reference — all handlers share this object.
// Reset by calling createSession() → gives a fresh QueueState.

const stateRef: { current: QueueState } = {
  current: createSession(),
};

// ─── REST endpoints ───────────────────────────────────────────────────────────

// Health check — Render pings this to keep the free instance awake
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    patients: stateRef.current.patients.length,
    sessionId: stateRef.current.session.id,
  });
});

// Reset session — receptionist can start a fresh day
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
  console.log(`   CORS     : ${ALLOWED_ORIGIN}`);
  console.log(`   Health   : http://localhost:${PORT}/health\n`);
});