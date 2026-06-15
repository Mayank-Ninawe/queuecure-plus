import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createSession } from "./queueEngine";
import { registerHandlers } from "./socketHandlers";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  QueueState,
} from "./types";

// ─── App bootstrap ────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow localhost during dev + FRONTEND_URL from env in production

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
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

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
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

// Root check
app.get("/", (_req, res) => {
  res.send("QueueCure+ backend is running");
});

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    patients: stateRef.current.patients.length,
    sessionId: stateRef.current.session.id,
  });
});

// Reset session
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

const PORT = Number(process.env.PORT) || 4001;

server.listen(PORT, () => {
  console.log(`\n🚀 QueueCure+ backend running`);
  console.log(`   Port     : ${PORT}`);
  console.log(`   Allowed  : ${allowedOrigins.join(", ")}`);
  console.log(`   Health   : http://localhost:${PORT}/health\n`);
});
