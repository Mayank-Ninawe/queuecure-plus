import { v4 as uuidv4 } from "uuid";
import {
  Patient,
  PatientStatus,
  QueueState,
  ClinicSession,
  QueueStats,
  PatientStats,
  EngineResult,
  TERMINAL_STATUSES,
} from "./types";

// ─── EMA weight: 30% new, 70% history ────────────────────────────────────────
// Gives more weight to recent consultations without forgetting history.
const EMA_ALPHA = 0.3;
const DEFAULT_AVG_MS = 7 * 60 * 1000; // 7 minutes fallback before any data exists

// ─── Session ──────────────────────────────────────────────────────────────────

export function createSession(): QueueState {
  const session: ClinicSession = {
    id: uuidv4(),
    status: "active",
    avgConsultationMs: DEFAULT_AVG_MS,
    consultationCount: 0,
    createdAt: Date.now(),
  };
  return { session, patients: [] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nextTokenNumber(patients: Patient[]): number {
  if (patients.length === 0) return 1;
  return Math.max(...patients.map((p) => p.tokenNumber)) + 1;
}

function updatePatient(
  patients: Patient[],
  patientId: string,
  updates: Partial<Patient>
): Patient[] {
  return patients.map((p) =>
    p.id === patientId ? { ...p, ...updates } : p
  );
}

function isTerminal(status: PatientStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

// ─── Core Engine Functions (all pure — return new state, never mutate) ────────

export function addPatient(
  state: QueueState,
  name: string,
  phone: string,
  priorityFlag: boolean
): EngineResult {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { success: false, error: "Patient name is required." };
  }
  if (state.session.status === "closed") {
    return { success: false, error: "Session is closed. Cannot add patients." };
  }

  const patient: Patient = {
    id: uuidv4(),
    name: trimmedName,
    phone: phone.trim(),
    tokenNumber: nextTokenNumber(state.patients),
    status: PatientStatus.WAITING,
    priorityFlag,
    sessionId: state.session.id,
    createdAt: Date.now(),
    calledAt: null,
    startedAt: null,
    completedAt: null,
  };

  // Priority patients are added to the front of the WAITING queue
  // by giving them the lowest tokenNumber among current WAITING patients.
  // Implementation: insert before first WAITING, renumber if priority.
  let patients: Patient[];
  if (priorityFlag) {
    const waitingTokens = state.patients
      .filter((p) => p.status === PatientStatus.WAITING)
      .map((p) => p.tokenNumber);
    const minWaiting = waitingTokens.length > 0 ? Math.min(...waitingTokens) : null;

    if (minWaiting !== null) {
      // Shift all WAITING patients' tokens up by 1, insert priority patient
      const shifted = state.patients.map((p) =>
        p.status === PatientStatus.WAITING && p.tokenNumber >= minWaiting
          ? { ...p, tokenNumber: p.tokenNumber + 1 }
          : p
      );
      patient.tokenNumber = minWaiting;
      patients = [...shifted, patient];
    } else {
      patients = [...state.patients, patient];
    }
  } else {
    patients = [...state.patients, patient];
  }

  return { success: true, state: { ...state, patients } };
}

export function callNext(state: QueueState): EngineResult {
  // Find the next WAITING patient (lowest tokenNumber)
  const waitingPatients = state.patients
    .filter((p) => p.status === PatientStatus.WAITING)
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  if (waitingPatients.length === 0) {
    return { success: false, error: "No patients waiting in queue." };
  }

  const next = waitingPatients[0];

  // Idempotency check: if this patient is already CALLED, it's a no-op
  // (handles double-click: server won't call the same patient twice)
  const alreadyCalled = state.patients.find(
    (p) => p.status === PatientStatus.CALLED
  );
  if (alreadyCalled?.id === next.id) {
    return { success: true, state }; // no-op, same state
  }

  const patients = updatePatient(state.patients, next.id, {
    status: PatientStatus.CALLED,
    calledAt: Date.now(),
  });

  return { success: true, state: { ...state, patients } };
}

export function startConsultation(
  state: QueueState,
  patientId: string
): EngineResult {
  const patient = state.patients.find((p) => p.id === patientId);

  if (!patient) {
    return { success: false, error: "Patient not found." };
  }
  if (patient.status !== PatientStatus.CALLED) {
    return {
      success: false,
      error: `Cannot start consultation: patient is ${patient.status}, not CALLED.`,
    };
  }

  // Enforce: only 1 IN_CONSULTATION per session
  const inConsultation = state.patients.find(
    (p) => p.status === PatientStatus.IN_CONSULTATION
  );
  if (inConsultation) {
    return {
      success: false,
      error: `Doctor is already in consultation with Token #${inConsultation.tokenNumber}. Complete it first.`,
    };
  }

  const patients = updatePatient(state.patients, patientId, {
    status: PatientStatus.IN_CONSULTATION,
    startedAt: Date.now(),
  });

  return { success: true, state: { ...state, patients } };
}

export function completeConsultation(
  state: QueueState,
  patientId: string
): EngineResult {
  const patient = state.patients.find((p) => p.id === patientId);

  if (!patient) {
    return { success: false, error: "Patient not found." };
  }
  if (patient.status !== PatientStatus.IN_CONSULTATION) {
    return {
      success: false,
      error: `Cannot complete: patient is ${patient.status}, not IN_CONSULTATION.`,
    };
  }
  if (patient.startedAt === null) {
    return { success: false, error: "Patient has no startedAt timestamp." };
  }

  const completedAt = Date.now();
  const duration = completedAt - patient.startedAt;

  // Update EMA: new_avg = alpha * duration + (1 - alpha) * prev_avg
  const prevAvg = state.session.avgConsultationMs;
  const newAvg =
    state.session.consultationCount === 0
      ? duration // first ever consultation: use actual duration directly
      : EMA_ALPHA * duration + (1 - EMA_ALPHA) * prevAvg;

  const patients = updatePatient(state.patients, patientId, {
    status: PatientStatus.COMPLETED,
    completedAt,
  });

  const session: ClinicSession = {
    ...state.session,
    avgConsultationMs: Math.round(newAvg),
    consultationCount: state.session.consultationCount + 1,
  };

  return { success: true, state: { session, patients } };
}

export function skipPatient(
  state: QueueState,
  patientId: string
): EngineResult {
  const patient = state.patients.find((p) => p.id === patientId);

  if (!patient) {
    return { success: false, error: "Patient not found." };
  }
  if (
    patient.status !== PatientStatus.WAITING &&
    patient.status !== PatientStatus.CALLED
  ) {
    return {
      success: false,
      error: `Cannot skip: patient is ${patient.status}.`,
    };
  }

  const patients = updatePatient(state.patients, patientId, {
    status: PatientStatus.SKIPPED,
  });

  return { success: true, state: { ...state, patients } };
}

export function cancelPatient(
  state: QueueState,
  patientId: string
): EngineResult {
  const patient = state.patients.find((p) => p.id === patientId);

  if (!patient) {
    return { success: false, error: "Patient not found." };
  }
  if (isTerminal(patient.status)) {
    return {
      success: false,
      error: `Cannot cancel: patient is already ${patient.status}.`,
    };
  }

  const patients = updatePatient(state.patients, patientId, {
    status: PatientStatus.CANCELLED,
  });

  return { success: true, state: { ...state, patients } };
}

export function updateAvgTime(
  state: QueueState,
  newAvgMs: number
): EngineResult {
  if (newAvgMs < 30_000) {
    return {
      success: false,
      error: "Average consultation time must be at least 30 seconds.",
    };
  }

  const session: ClinicSession = {
    ...state.session,
    avgConsultationMs: newAvgMs,
  };

  return { success: true, state: { ...state, session } };
}

// ─── Derived Stats ────────────────────────────────────────────────────────────

export function getQueueStats(state: QueueState): QueueStats {
  const { patients, session } = state;

  const currentConsultation = patients.find(
    (p) => p.status === PatientStatus.IN_CONSULTATION
  );
  const calledPatient = patients.find(
    (p) => p.status === PatientStatus.CALLED
  );

  const waitingPatients = patients
    .filter((p) => p.status === PatientStatus.WAITING)
    .sort((a, b) => a.tokenNumber - b.tokenNumber);

  const perPatient: PatientStats[] = waitingPatients.map((p, index) => ({
    patientId: p.id,
    tokenNumber: p.tokenNumber,
    tokensAhead: index, // 0 = next in line
    estimatedWaitMs: index * session.avgConsultationMs,
  }));

  return {
    currentToken: currentConsultation?.tokenNumber ?? null,
    calledToken: calledPatient?.tokenNumber ?? null,
    waitingCount: waitingPatients.length,
    avgConsultationMs: session.avgConsultationMs,
    perPatient,
  };
}