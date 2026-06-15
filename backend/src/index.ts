import "dotenv/config";
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createSession, getQueueStats } from "./queueEngine";
import { registerHandlers } from "./socketHandlers";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  QueueState,
} from "./types";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

const corsOriginValidator = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Not allowed by CORS: ${origin}`));
};

app.use(
  cors({
    origin: corsOriginValidator,
    credentials: true,
  })
);

app.use(express.json());

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: corsOriginValidator,
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

const stateRef: { current: QueueState } = {
  current: createSession(),
};

app.get("/", (_req: Request, res: Response) => {
  res.send("QueueCure+ backend is running");
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    patients: stateRef.current.patients.length,
    sessionId: stateRef.current.session.id,
    allowedOrigins,
  });
});

app.post("/reset", (_req: Request, res: Response) => {
  stateRef.current = createSession();
  const stats = getQueueStats(stateRef.current);

  io.emit("queue:sync", {
    session: stateRef.current.session,
    patients: stateRef.current.patients,
    stats,
  });

  res.json({
    success: true,
    message: "Session reset. Fresh queue started.",
  });
});

io.on("connection", (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`[socket] Client disconnected: ${socket.id} (${reason})`);
  });

  registerHandlers(io, socket, stateRef);
});

const PORT = Number(process.env.PORT) || 4001;

server.listen(PORT, () => {
  console.log("\n🚀 QueueCure+ backend running");
  console.log(`   Port      : ${PORT}`);
  console.log(
    `   Allowed   : ${allowedOrigins.length ? allowedOrigins.join(", ") : "none"}`
  );
  console.log(`   Health    : http://localhost:${PORT}/health\n`);
});