// ─── Patient Status State Machine ────────────────────────────────────────────
// WAITING → CALLED → IN_CONSULTATION → COMPLETED
//                 ↘ SKIPPED
// any terminal state: COMPLETED | SKIPPED | CANCELLED (no exit)

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
  priorityFlag: boolean; // emergency / senior citizen
  sessionId: string;
  createdAt: number;      // Date.now()
  calledAt: number | null;
  startedAt: number | null;
  completedAt: number | null;
}

export interface ClinicSession {
  id: string;
  status: "active" | "closed";
  avgConsultationMs: number;  // exponential moving average, updated on each COMPLETE
  consultationCount: number;  // how many completed consultations so far
  createdAt: number;
}

// The single source of truth — everything the server holds in memory
export interface QueueState {
  session: ClinicSession;
  patients: Patient[];
}

// ─── Derived Stats (computed, never stored) ───────────────────────────────────

export interface PatientStats {
  patientId: string;
  tokenNumber: number;
  tokensAhead: number;
  estimatedWaitMs: number;
}

export interface QueueStats {
  currentToken: number | null;      // token currently IN_CONSULTATION
  calledToken: number | null;        // token that is CALLED (being summoned)
  waitingCount: number;
  avgConsultationMs: number;
  perPatient: PatientStats[];        // stats for every WAITING patient
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
  avgConsultationMs: number; // manual override by receptionist
}

// Server → Client events
export interface ServerToClientEvents {
  "queue:sync": (state: QueueState & { stats: QueueStats }) => void;
  "queue:error": (message: string) => void;
}

// Client → Server events
export interface ClientToServerEvents {
  "patient:add": (payload: AddPatientPayload) => void;
  "queue:call_next": () => void;
  "queue:start": (payload: PatientActionPayload) => void;
  "queue:complete": (payload: PatientActionPayload) => void;
  "queue:skip": (payload: PatientActionPayload) => void;
  "queue:cancel": (payload: PatientActionPayload) => void;
  "queue:sync_request": () => void;
  "queue:update_avg_time": (payload: UpdateAvgTimePayload) => void;
}

// ─── Engine Result (either success with new state, or typed error) ────────────

export type EngineResult =
  | { success: true; state: QueueState }
  | { success: false; error: string };