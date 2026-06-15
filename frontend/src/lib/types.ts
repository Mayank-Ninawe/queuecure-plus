// ─── Patient Status ───────────────────────────────────────────────────────────

export enum PatientStatus {
  WAITING = "WAITING",
  CALLED = "CALLED",
  IN_CONSULTATION = "IN_CONSULTATION",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  CANCELLED = "CANCELLED",
}

export const TERMINAL_STATUSES: PatientStatus[] = [
  PatientStatus.COMPLETED,
  PatientStatus.SKIPPED,
  PatientStatus.CANCELLED,
];

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  phone: string;
  tokenNumber: number;
  status: PatientStatus;
  priorityFlag: boolean;
  sessionId: string;
  createdAt: number;
  calledAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
}

export interface ClinicSession {
  id: string;
  status: "active" | "closed";
  avgConsultationMs: number;
  consultationCount: number;
  createdAt: number;
}

export interface PatientStats {
  patientId: string;
  tokenNumber: number;
  tokensAhead: number;
  estimatedWaitMs: number;
}

export interface QueueStats {
  currentToken: number | null;
  calledToken: number | null;
  waitingCount: number;
  avgConsultationMs: number;
  perPatient: PatientStats[];
}

// Full sync payload from server
export interface QueueSyncPayload {
  session: ClinicSession;
  patients: Patient[];
  stats: QueueStats;
}

// ─── Socket Event Payloads ────────────────────────────────────────────────────

export interface AddPatientPayload {
  name: string;
  phone: string;
  priorityFlag: boolean;
}

export interface PatientActionPayload {
  patientId: string;
}

export interface UpdateAvgTimePayload {
  avgConsultationMs: number;
}

export interface ServerToClientEvents {
  "queue:sync": (payload: QueueSyncPayload) => void;
  "queue:error": (message: string) => void;
}

export interface ClientToServerEvents {
  "queue:sync_request": () => void;
  "patient:add": (payload: AddPatientPayload) => void;
  "queue:call_next": () => void;
  "queue:start": (payload: PatientActionPayload) => void;
  "queue:complete": (payload: PatientActionPayload) => void;
  "queue:skip": (payload: PatientActionPayload) => void;
  "queue:cancel": (payload: PatientActionPayload) => void;
  "queue:update_avg_time": (payload: UpdateAvgTimePayload) => void;
}
// ─── UI State ─────────────────────────────────────────────────────────────────

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";