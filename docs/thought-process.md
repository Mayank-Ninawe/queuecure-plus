# QueueCure+ — Thought Process

## 1. Problem Restatement

76% of Indian clinics run on paper token slips and verbal calls.
A patient has zero visibility into wait time. A receptionist manages
everything from memory. One accidental double-call or missed token
collapses the entire queue.

**Core requirements:**
- Receptionist adds patients, calls next, tracks consultation state
- Patient display shows current token + estimated wait — live, without refresh
- Wait time must come from real consultation durations, not a hardcoded constant
- System must be resilient to double-clicks, multi-tab receptionists, and reconnects

---

## 2. Data Model

### PatientStatus — State Machine

Every patient token moves through a strict one-way state machine:
WAITING → CALLED → IN_CONSULTATION → COMPLETED
↓ ↓
SKIPPED CANCELLED

text

**Invariants enforced by the server:**
- A token can only move **forward** along valid edges — no backward transitions
- At most **one** token is IN_CONSULTATION at any time (single-doctor model)
- `callNext` always picks the lowest tokenNumber with status WAITING
- A token in SKIPPED/CANCELLED state is never picked by `callNext`

### Core Entities

```typescript
interface Patient {
  id: string;             // UUID
  tokenNumber: number;    // auto-incremented per session
  name: string;
  phone?: string;
  priorityFlag: boolean;  // emergency / senior citizen
  status: PatientStatus;
  createdAt: number;      // epoch ms
  calledAt?: number;
  startedAt?: number;     // set when IN_CONSULTATION begins
  completedAt?: number;   // set when COMPLETED
}

interface ClinicSession {
  id: string;
  tokenCounter: number;          // next token to assign
  avgConsultationMs: number;     // exponential moving average
  completedCount: number;        // samples in the EMA
  patients: Map<string, Patient>;
}
```

---

## 3. Wait Time Formula

Wait time is derived entirely from **real consultation durations** logged
per session. No hardcoded constant is ever used.

### Duration Logging

On every `queue:complete` event:
duration = completedAt - startedAt

text

### Exponential Moving Average (EMA)

New duration is blended into a running average using EMA (α = 0.3):
if (completedCount === 0):
avgConsultationMs = duration // first sample — use directly

else:
avgConsultationMs = 0.7 × prevAvg + 0.3 × duration

text

EMA gives more weight to recent consultations (fast doctors, slow days)
rather than treating all historical data equally.

### Per-Patient Estimate

For a patient with `k` tokens ahead of them in WAITING status:
estimatedWaitMs = k × avgConsultationMs

text

**Example:**
- 3 consultations done: 5m, 8m, 6m → avg ≈ 6.5m
- Patient has 4 tokens ahead
- Estimated wait = 4 × 6.5 = **26 minutes**

This value is recomputed on every `queue:sync` broadcast, so it adapts
in real time as consultations finish faster or slower.

---

## 4. Socket Event Architecture

### Event Flow
Receptionist Browser Backend (queue engine) Patient Browser
│ │ │
│── patient:add ────────────────────────>│ │
│ │── addPatient() ────────────── │
│ │── broadcast queue:sync ───────>│
│<──────────────────── queue:sync ───────│<──────────────────────────────>│
│ │ │
│── queue:call_next ─────────────────────>│ │
│ │── callNext() ──────────────── │
│ │── broadcast queue:sync ───────>│
│<──────────────────── queue:sync ───────│<──────────────────────────────>│
│ │ │
│── queue:start ─────────────────────────>│ │
│── queue:complete ───────────────────────>│ (logs duration, updates EMA) │
│── queue:skip ───────────────────────────>│ │
│── queue:cancel ─────────────────────────>│ │
│ │ │
│── queue:sync_request ──────────────────>│ (on reconnect) │
│<──────────────────── queue:sync ───────│ │

text

### Broadcast Model

The backend maintains a **single source of truth** in memory.
After every state mutation, it broadcasts `queue:sync` to **all connected clients**
with the full queue snapshot. No client-side state merging is needed —
clients always replace their local state with the server snapshot.

This means:
- Two receptionist tabs see the same queue instantly
- A refreshed waiting-room screen gets full state on reconnect
- No stale local state can corrupt the queue

---

## 5. Concurrency & Edge Cases

### Double-Click on "Call Next"

**Problem:** Receptionist clicks "Call Next" twice in 200ms. Two events
hit the server. Two different tokens get called.

**Solution:** Server-side idempotency guard in `callNext()`:

```typescript
function callNext(session: ClinicSession): Patient | null {
  // If a CALLED token already exists, no-op — don't call another
  const alreadyCalled = [...session.patients.values()]
    .find(p => p.status === PatientStatus.CALLED);
  if (alreadyCalled) return null;

  // Proceed only if clear
  const next = getNextWaiting(session);
  if (!next) return null;
  next.status = PatientStatus.CALLED;
  next.calledAt = Date.now();
  return next;
}
```

Frontend also disables the "Call Next" button while a `CALLED` token exists.

### Multi-Tab Receptionist

Two browser tabs both open `/reception`. Both emit events.
Since all state lives on the server and every mutation broadcasts
`queue:sync` to all sockets, both tabs see the same state within
one network round-trip. No local-first state exists.

### Patient Reconnect

When a waiting-room screen refreshes or reconnects:

```typescript
socket.on('queue:sync_request', () => {
  socket.emit('queue:sync', serializeSession(session));
});
```

The client emits `queue:sync_request` on `connect` event —
full state is delivered without needing to replay any events.

### No-Show / Skip

A skipped patient is never picked by `callNext()`.
The receptionist can still manually cancel them later.
Their token slot is retired — token numbers never get reused
(prevents confusion on the patient display).

### Empty Queue Call

`callNext()` called when queue is empty → returns `null` → server
does not broadcast (no state change). Frontend button is disabled
when `waitingCount === 0`.

### Doctor Delay / Long Consultation

EMA naturally adapts: if one consultation takes 20 minutes,
the avg shifts upward and all downstream wait estimates increase
in real time on the next `queue:sync`.

---

## 6. Architecture Decisions & Trade-offs

| Decision | Chosen Approach | Trade-off |
|---|---|---|
| State storage | In-memory per server process | Fast; lost on restart — acceptable for single-clinic demo |
| Realtime | Socket.io (WebSocket) | Full event control vs Firebase simplicity |
| Wait time | EMA over real durations | Adaptive but needs ≥1 sample; shows "—" until first completion |
| Token assignment | Sequential counter | Simple, readable; no random IDs in queue display |
| Multi-doctor | Not implemented | Scope tradeoff; architecture supports it via `doctorId` field |
| Auth | None | Demo scope; real deployment would add PIN-based receptionist auth |

---

## 7. What a Real Deployment Would Need

- **Persistence:** Replace in-memory Map with Redis or a lightweight DB (SQLite, PostgreSQL)
- **Multi-doctor:** Route tokens to specific doctor queues
- **SMS:** Notify patient via Twilio when their token is called
- **Auth:** PIN-based receptionist login
- **Analytics:** Daily avg consultation time, peak hours dashboard
- **Offline mode:** Service worker queues events locally when internet drops

---

*Built for Queue Cure '26 — Wooble Software Private Limited*