import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

interface UseQueueReturn {
  session: ClinicSession | null;
  patients: Patient[];
  stats: QueueStats | null;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  isLoading: boolean;

  waitingPatients: Patient[];
  calledPatient: Patient | null;
  inConsultationPatient: Patient | null;
  activePatients: Patient[];

  addPatient: (payload: AddPatientPayload) => void;
  callNext: () => void;
  startConsultation: (patientId: string) => void;
  completeConsultation: (patientId: string) => void;
  skipPatient: (patientId: string) => void;
  cancelPatient: (patientId: string) => void;
  updateAvgTime: (avgConsultationMs: number) => void;
  clearError: () => void;
}

export function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  if (seconds === 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export function formatWait(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "Next up";

  const minutes = Math.round(ms / 60000);

  if (minutes < 1) return "< 1 min";
  if (minutes === 1) return "~1 min";
  return `~${minutes} mins`;
}

export function useQueue(): UseQueueReturn {
  const [session, setSession] = useState<ClinicSession | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [lastError, setLastError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const errorTimeoutRef = useRef<number | null>(null);

  const clearScheduledError = useCallback(() => {
    if (errorTimeoutRef.current !== null) {
      window.clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const showTemporaryError = useCallback(
    (message: string) => {
      clearScheduledError();
      setLastError(message);
      errorTimeoutRef.current = window.setTimeout(() => {
        setLastError(null);
        errorTimeoutRef.current = null;
      }, 4000);
    },
    [clearScheduledError]
  );

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
    console.error("[socket] Connection error:", err.message);
    setConnectionStatus("error");
    setIsLoading(false);
    showTemporaryError(`Connection failed: ${err.message}`);
  }

  function onQueueSync(payload: QueueSyncPayload) {
    setSession(payload.session);
    setPatients(payload.patients);
    setStats(payload.stats);
    setIsLoading(false);
    setConnectionStatus("connected");
  }

  function onQueueError(message: string) {
    showTemporaryError(String(message));
  }

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  socket.on("connect_error", onConnectError);
  socket.on("queue:sync", onQueueSync);
  socket.on("queue:error", onQueueError);

  if (socket.connected) {
    onConnect();
  } else {
    socket.connect();
  }

  return () => {
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.off("connect_error", onConnectError);
    socket.off("queue:sync", onQueueSync);
    socket.off("queue:error", onQueueError);
    clearScheduledError();
  };
}, [clearScheduledError, showTemporaryError]);

  const waitingPatients = useMemo(
    () =>
      patients
        .filter((p) => p.status === PatientStatus.WAITING)
        .sort((a, b) => a.tokenNumber - b.tokenNumber),
    [patients]
  );

  const calledPatient = useMemo(
    () => patients.find((p) => p.status === PatientStatus.CALLED) ?? null,
    [patients]
  );

  const inConsultationPatient = useMemo(
    () =>
      patients.find((p) => p.status === PatientStatus.IN_CONSULTATION) ?? null,
    [patients]
  );

  const activePatients = useMemo(
    () =>
      patients
        .filter(
          (p) =>
            p.status === PatientStatus.WAITING ||
            p.status === PatientStatus.CALLED ||
            p.status === PatientStatus.IN_CONSULTATION
        )
        .sort((a, b) => a.tokenNumber - b.tokenNumber),
    [patients]
  );

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

  const clearError = useCallback(() => {
    clearScheduledError();
    setLastError(null);
  }, [clearScheduledError]);

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