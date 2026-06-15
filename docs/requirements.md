# QueueCure+ Requirements

## 1. Objective
To provide a digitized, real-time queue management system that replaces paper tokens and manual calling. It focuses on offering exact visibility into waiting times for patients and providing a seamless management dashboard for receptionists.

## 2. User Roles & Interfaces
The system provides interfaces for two main user roles:

### 2.1 Receptionist (`/reception`)
- **Add Patients:** Ability to register new patients to the queue (name, optional phone, and priority flags like emergency/senior citizen).
- **Queue Management:** Ability to manage patient states sequentially.
  - Call Next (Moves WAITING to CALLED)
  - Start Consultation (Moves CALLED to IN_CONSULTATION)
  - Complete Consultation (Moves IN_CONSULTATION to COMPLETED)
  - Skip / Cancel (Handles no-shows or early departures)
- **Real-Time Data:** View the entire queue in real-time, including currently waiting patients and overall queue statistics.
- **Session Reset:** Ability to reset the queue for a new day or session.

### 2.2 Patient (`/waiting-room`)
- **Live Board:** Real-time display showing the currently called token number.
- **Queue List:** Display of upcoming tokens.
- **Dynamic Wait Time:** Auto-updating estimated wait times based on historical consultation durations from the current session.

## 3. Functional Requirements
- **State Machine:** Patients must move through a strict, forward-only lifecycle: `WAITING -> CALLED -> IN_CONSULTATION -> COMPLETED`. Alternative ending states include `SKIPPED` and `CANCELLED`.
- **Dynamic Wait Estimation:** Wait times must not be hardcoded. They must be calculated using an Exponential Moving Average (EMA) of real consultation times recorded during the session.
- **Idempotency:** The system must prevent duplicate actions (e.g., clicking "Call Next" twice rapidly should not call two patients simultaneously).
- **Auto-Sync:** Connected clients must receive state updates instantly upon any mutation without manual refresh. Reconnections must fetch the complete state immediately.

## 4. Non-Functional Requirements
- **Resilience:** The backend must handle multi-tab operations smoothly, ensuring consistent state across all connected receptionists.
- **Latency:** State updates must reflect across patient boards and receptionist dashboards with sub-second latency via WebSockets.
- **Deployment:** The frontend must be deployable as a static SPA (Vite/Vercel) and the backend as a Node.js web service (Render).

*Built for Queue Cure '26 — Wooble Software Private Limited*
