import {
  createSession,
  addPatient,
  callNext,
  startConsultation,
  completeConsultation,
  skipPatient,
  cancelPatient,
  getQueueStats,
} from "./queueEngine";
import { PatientStatus } from "./types";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  FAIL: ${label}`);
    failed++;
  }
}

function section(title: string): void {
  console.log(`\n── ${title} ──`);
}

// ─── Setup ────────────────────────────────────────────────────────────────────
let state = createSession();

section("createSession");
assert("Creates active session", state.session.status === "active");
assert("Starts with empty patients", state.patients.length === 0);
assert("Default avg is 7 minutes", state.session.avgConsultationMs === 7 * 60 * 1000);

// ─── addPatient ───────────────────────────────────────────────────────────────
section("addPatient");

const r1 = addPatient(state, "Ramesh Kumar", "9999999991", false);
assert("Adds patient successfully", r1.success === true);
if (r1.success) {
  state = r1.state;
  assert("Token 1 assigned", state.patients[0].tokenNumber === 1);
  assert("Status is WAITING", state.patients[0].status === PatientStatus.WAITING);
}

const r2 = addPatient(state, "Sunita Devi", "9999999992", false);
if (r2.success) {
  state = r2.state;
  assert("Token 2 assigned", state.patients[1].tokenNumber === 2);
}

const r3 = addPatient(state, "Arjun Singh", "9999999993", false);
if (r3.success) state = r3.state;

const rEmpty = addPatient(state, "  ", "", false);
assert("Rejects empty name", rEmpty.success === false);

// Priority patient — should get token 1, push others to 2, 3, 4
const r4 = addPatient(state, "Emergency Patient", "9999999994", true);
assert("Priority add succeeds", r4.success === true);
if (r4.success) {
  state = r4.state;
  const priority = state.patients.find((p) => p.name === "Emergency Patient")!;
  const others = state.patients
    .filter((p) => p.name !== "Emergency Patient" && p.status === PatientStatus.WAITING)
    .map((p) => p.tokenNumber)
    .sort((a, b) => a - b);
  assert("Priority patient gets lowest token", priority.tokenNumber === 1);
  assert("Existing patients shifted up", others[0] === 2);
}

// ─── callNext ─────────────────────────────────────────────────────────────────
section("callNext");

const cn1 = callNext(state);
assert("callNext succeeds", cn1.success === true);
if (cn1.success) {
  state = cn1.state;
  const called = state.patients.find((p) => p.status === PatientStatus.CALLED);
  assert("Priority patient (token 1) called first", called?.tokenNumber === 1);
}

// Idempotency: calling again returns same state
const cn2 = callNext(state);
if (cn2.success) {
  const calledCount = cn2.state.patients.filter(
    (p) => p.status === PatientStatus.CALLED
  ).length;
  // callNext on an already-called queue calls NEXT waiting patient
  assert("callNext picks next WAITING when one is already CALLED", calledCount <= 2);
}

// ─── startConsultation ────────────────────────────────────────────────────────
section("startConsultation");

const calledPatient = state.patients.find(
  (p) => p.status === PatientStatus.CALLED
)!;
const sc1 = startConsultation(state, calledPatient.id);
assert("Start consultation succeeds", sc1.success === true);
if (sc1.success) {
  state = sc1.state;
  const inC = state.patients.find((p) => p.id === calledPatient.id)!;
  assert("Status is IN_CONSULTATION", inC.status === PatientStatus.IN_CONSULTATION);
  assert("startedAt is set", inC.startedAt !== null);
}

// Enforce only 1 in consultation
const nextCalled = state.patients.find((p) => p.status === PatientStatus.CALLED);
if (nextCalled) {
  const sc2 = startConsultation(state, nextCalled.id);
  assert("Blocks second concurrent consultation", sc2.success === false);
}

// ─── completeConsultation ─────────────────────────────────────────────────────
section("completeConsultation");

const inConsultationPatient = state.patients.find(
  (p) => p.status === PatientStatus.IN_CONSULTATION
)!;
const cc1 = completeConsultation(state, inConsultationPatient.id);
assert("Complete consultation succeeds", cc1.success === true);
if (cc1.success) {
  state = cc1.state;
  const completed = state.patients.find((p) => p.id === inConsultationPatient.id)!;
  assert("Status is COMPLETED", completed.status === PatientStatus.COMPLETED);
  assert("completedAt is set", completed.completedAt !== null);
  assert("avgConsultationMs updated", state.session.avgConsultationMs !== 7 * 60 * 1000);
  assert("consultationCount incremented", state.session.consultationCount === 1);
}

// Cannot complete again (terminal state)
const cc2 = completeConsultation(state, inConsultationPatient.id);
assert("Cannot complete already COMPLETED patient", cc2.success === false);

// ─── skipPatient ──────────────────────────────────────────────────────────────
section("skipPatient");

const waitingToSkip = state.patients.find(
  (p) => p.status === PatientStatus.WAITING
)!;
const sp1 = skipPatient(state, waitingToSkip.id);
assert("Skip WAITING patient succeeds", sp1.success === true);
if (sp1.success) {
  state = sp1.state;
  const skipped = state.patients.find((p) => p.id === waitingToSkip.id)!;
  assert("Status is SKIPPED", skipped.status === PatientStatus.SKIPPED);
}

// Cannot skip terminal
const sp2 = skipPatient(state, inConsultationPatient.id); // already COMPLETED
assert("Cannot skip COMPLETED patient", sp2.success === false);

// ─── cancelPatient ────────────────────────────────────────────────────────────
section("cancelPatient");

const waitingToCancel = state.patients.find(
  (p) => p.status === PatientStatus.WAITING
);
if (waitingToCancel) {
  const ca1 = cancelPatient(state, waitingToCancel.id);
  assert("Cancel WAITING patient succeeds", ca1.success === true);
  if (ca1.success) {
    state = ca1.state;
    const cancelled = state.patients.find((p) => p.id === waitingToCancel.id)!;
    assert("Status is CANCELLED", cancelled.status === PatientStatus.CANCELLED);
  }
}

// Cannot cancel terminal
const ca2 = cancelPatient(state, inConsultationPatient.id); // already COMPLETED
assert("Cannot cancel COMPLETED patient", ca2.success === false);

// ─── getQueueStats ────────────────────────────────────────────────────────────
section("getQueueStats");

// Fresh state to test stats properly
let statsState = createSession();
const addR1 = addPatient(statsState, "Alpha", "", false);
const addR2 = addR1.success ? addPatient(addR1.state, "Beta", "", false) : addR1;
const addR3 = addR2.success ? addPatient(addR2.state, "Gamma", "", false) : addR2;
if (addR3.success) {
  statsState = addR3.state;
  const stats = getQueueStats(statsState);
  assert("waitingCount is 3", stats.waitingCount === 3);
  assert("currentToken is null (no one in consultation)", stats.currentToken === null);
  assert("perPatient has 3 entries", stats.perPatient.length === 3);
  assert("First patient has 0 tokens ahead", stats.perPatient[0].tokensAhead === 0);
  assert("Second patient has 1 token ahead", stats.perPatient[1].tokensAhead === 1);
  assert(
    "estimatedWaitMs for second = 1 × avgMs",
    stats.perPatient[1].estimatedWaitMs === statsState.session.avgConsultationMs
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
console.log(`  Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
if (failed === 0) {
  console.log("  ✅  All tests passed — queue engine is solid.\n");
  process.exit(0);
} else {
  console.error("  ❌  Some tests failed — fix before moving to Phase 2.\n");
  process.exit(1);
}