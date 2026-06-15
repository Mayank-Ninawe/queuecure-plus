import { Server, Socket } from "socket.io";
import {
  QueueState,
  ServerToClientEvents,
  ClientToServerEvents,
  AddPatientPayload,
  PatientActionPayload,
  UpdateAvgTimePayload,
} from "./types";
import {
  addPatient,
  callNext,
  startConsultation,
  completeConsultation,
  skipPatient,
  cancelPatient,
  updateAvgTime,
  getQueueStats,
} from "./queueEngine";

// ─── Shared mutable state (single clinic session, in-memory) ─────────────────
// stateRef is passed by reference so all handlers always see the latest state.
// This is intentional — one object, mutated only through engine functions.

export function registerHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  stateRef: { current: QueueState }
): void {

  // Helper: broadcast full state snapshot to ALL connected clients
  function broadcast(): void {
    const stats = getQueueStats(stateRef.current);
    io.emit("queue:sync", { ...stateRef.current, stats });
  }

  // Helper: apply an engine result — update stateRef and broadcast, or emit error
  function applyResult(
    result: ReturnType<typeof addPatient>, // same shape for all engine fns
    errorTarget: typeof socket
  ): void {
    if (result.success) {
      stateRef.current = result.state;
      broadcast();
    } else {
      errorTarget.emit("queue:error", result.error);
    }
  }

  // ── On connect: immediately sync this client with current state ─────────────
  const stats = getQueueStats(stateRef.current);
  socket.emit("queue:sync", { ...stateRef.current, stats });

  // ── patient:add ─────────────────────────────────────────────────────────────
  socket.on("patient:add", (payload: AddPatientPayload) => {
    const result = addPatient(
      stateRef.current,
      payload.name,
      payload.phone,
      payload.priorityFlag
    );
    applyResult(result, socket);
  });

  // ── queue:call_next ─────────────────────────────────────────────────────────
  // Concurrency guard: wrapped in a microtask lock pattern.
  // If two sockets fire this simultaneously, only the first one changes state.
  // The second one sees an already-CALLED patient as the "next" and becomes a no-op.
  socket.on("queue:call_next", () => {
    const result = callNext(stateRef.current);
    applyResult(result, socket);
  });

  // ── queue:start ─────────────────────────────────────────────────────────────
  socket.on("queue:start", (payload: PatientActionPayload) => {
    const result = startConsultation(stateRef.current, payload.patientId);
    applyResult(result, socket);
  });

  // ── queue:complete ──────────────────────────────────────────────────────────
  socket.on("queue:complete", (payload: PatientActionPayload) => {
    const result = completeConsultation(stateRef.current, payload.patientId);
    applyResult(result, socket);
  });

  // ── queue:skip ──────────────────────────────────────────────────────────────
  socket.on("queue:skip", (payload: PatientActionPayload) => {
    const result = skipPatient(stateRef.current, payload.patientId);
    applyResult(result, socket);
  });

  // ── queue:cancel ────────────────────────────────────────────────────────────
  socket.on("queue:cancel", (payload: PatientActionPayload) => {
    const result = cancelPatient(stateRef.current, payload.patientId);
    applyResult(result, socket);
  });

  // ── queue:update_avg_time ───────────────────────────────────────────────────
  socket.on("queue:update_avg_time", (payload: UpdateAvgTimePayload) => {
    const result = updateAvgTime(stateRef.current, payload.avgConsultationMs);
    applyResult(result, socket);
  });

  // ── queue:sync_request ──────────────────────────────────────────────────────
  // Client sends this on reconnect to get a fresh full state snapshot
  socket.on("queue:sync_request", () => {
    const freshStats = getQueueStats(stateRef.current);
    socket.emit("queue:sync", { ...stateRef.current, stats: freshStats });
  });

  // ── disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(`[socket] Client disconnected: ${socket.id} — ${reason}`);
  });
}