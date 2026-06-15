/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import socket from "../lib/socket";
import {
  QueueSyncPayload,
  Patient,
  PatientStatus,
  QueueStats,
  ClinicSession,
  ConnectionStatus,
  AddPatientPayload,
  PatientActionPayload,
  UpdateAvgTimePayload,
} from "../lib/types";

// ─── Shape of what useQueue exposes ──────────────────────────────────────────

interface UseQueueReturn {
  // State
  session: ClinicSession | null;
  patients: Patient[];
  stats: QueueStats | null;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  isLoading: boolean;

  // Derived helpers (memoized filters — no re-computation in components)
  waitingPatients: Patient[];
  calledPatient: Patient | null;
  inConsultationPatient: Patient | null;
  activePatients: Patient[];

  // Actions — each returns void, errors surface via lastError state
  addPatient: (payload: AddPatientPayload) => void;
  callNext: () => void;
  startConsultation: (patientId: string) => void;
  completeConsultation: (patientId: string) => void;
  skipPatient: (patientId: string) => void;
  cancelPatient: (patientId: string) => void;
  updateAvgTime: (avgConsultationMs: number) => void;
  clearError: () => void;
}

// ─── Default avg time formatting helper (exported for components) ─────────────

export function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export function formatWait(ms: number): string {
  if (ms <= 0) return "Next up";
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "< 1 min";
  if (minutes === 1) return "~1 min";
  return `~${minutes} mins`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQueue(): UseQueueReturn {
  const [session, setSession] = useState<ClinicSession | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    function onConnect() {
      setConnectionStatus("connected");
      setIsLoading(false);
      socket.emit("queue:sync_request");
    }

    function onDisconnect(reason: string) {
      console.warn("[socket] Disconnected:", reason);
      setConnectionStatus("disconnected");
    }

    function onConnectError(err: Error) {
      setConnectionStatus("error");
      setLastError(`Connection failed: ${err.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onQueueSync(payload: any) {
      setSession(payload.session);
      setPatients(payload.patients);
      setStats(payload.stats);
      setIsLoading(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onQueueError(message: any) {
      setLastError(String(message));
      setTimeout(() => setLastError(null), 4000);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("queue:sync", onQueueSync);
    socket.on("queue:error", onQueueError);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("queue:sync", onQueueSync);
      socket.off("queue:error", onQueueError);
    };
  }, []);

  // ─── Derived state (computed once here, not in every component) ───────────

  const waitingPatients = patients
    .filter((p) => p.status === PatientStatus.WAITING)
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  const calledPatient = patients.find((p) => p.status === PatientStatus.CALLED) ?? null;

  const inConsultationPatient =
    patients.find((p) => p.status === PatientStatus.IN_CONSULTATION) ?? null;

  const activePatients = patients
    .filter(
      (p) =>
        p.status === PatientStatus.WAITING ||
        p.status === PatientStatus.CALLED ||
        p.status === PatientStatus.IN_CONSULTATION
    )
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const addPatient = useCallback((payload: AddPatientPayload) => {
    socket.emit("patient:add", payload);
  }, []);

  const callNext = useCallback(() => {
    socket.emit("queue:call_next");
  }, []);

  const startConsultation = useCallback((patientId: string) => {
    const payload: PatientActionPayload = { patientId };
    socket.emit("queue:start", payload);
  }, []);

  const completeConsultation = useCallback((patientId: string) => {
    const payload: PatientActionPayload = { patientId };
    socket.emit("queue:complete", payload);
  }, []);

  const skipPatient = useCallback((patientId: string) => {
    const payload: PatientActionPayload = { patientId };
    socket.emit("queue:skip", payload);
  }, []);

  const cancelPatient = useCallback((patientId: string) => {
    const payload: PatientActionPayload = { patientId };
    socket.emit("queue:cancel", payload);
  }, []);

  const updateAvgTime = useCallback((avgConsultationMs: number) => {
    const payload: UpdateAvgTimePayload = { avgConsultationMs };
    socket.emit("queue:update_avg_time", payload);
  }, []);

  const clearError = useCallback(() => setLastError(null), []);

  return {
    session,
    patients,
    stats,
    connectionStatus,
    lastError,
    isLoading,
    waitingPatients,
    calledPatient,
    inConsultationPatient,
    activePatients,
    addPatient,
    callNext,
    startConsultation,
    completeConsultation,
    skipPatient,
    cancelPatient,
    updateAvgTime,
    clearError,
  };
}