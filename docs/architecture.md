# QueueCure+ Architecture

## 1. System Overview
QueueCure+ is built as a distributed, real-time web application. It consists of a decoupled Single Page Application (SPA) frontend and a Node.js/Express backend communicating primarily over WebSockets for live synchronization.

## 2. Tech Stack
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Node.js, Express, Socket.io, TypeScript
- **Deployment:** 
  - Frontend hosted on Vercel
  - Backend hosted on Render

## 3. Component Architecture

### 3.1 Frontend
- **Routing:** Handled via React Router (`/reception` and `/waiting-room`).
- **State Management:** Local UI state is kept minimal. The core queue state is mirrored from the backend socket broadcasts, acting as a single source of truth.
- **Socket Client:** Connects to the backend via `socket.io-client`. It automatically attempts reconnection and requests a full state sync (`queue:sync_request`) upon connection.

### 3.2 Backend
- **Express Server:** Serves health checks (`/health`) and handles session resets (`/reset`). Also configures CORS to ensure secure cross-origin communication with the frontend.
- **Socket.io Server:** Handles all bi-directional real-time communication.
- **Queue Engine (`queueEngine.ts`):** Contains the core business logic.
  - Maintains an in-memory `ClinicSession` containing patients and statistics.
  - Computes the Exponential Moving Average (EMA) for consultation durations.
- **State Flow:** The backend holds the authoritative state. Any client action (e.g., `patient:add`) mutates the server-side state, which immediately triggers a `queue:sync` broadcast to all connected clients.

## 4. Real-Time Communication Protocol
The system relies on specific socket events to ensure synchronization:

### Client to Server Events
- `queue:sync_request`: Requests the full session state.
- `patient:add`: Registers a new patient.
- `queue:call_next`: Retrieves the next waiting token.
- `queue:start`: Marks a token as currently consulting.
- `queue:complete`: Finishes a consultation and logs the duration.
- `queue:skip` / `queue:cancel`: Alters token states for exceptions.

### Server to Client Events
- `queue:sync`: Broadcasts the complete `ClinicSession` (patients list, current session details, stats) to all clients.

## 5. Deployment Architecture
- **Vercel (Frontend):** Configured with SPA rewrite rules (`vercel.json`) to redirect all paths to `index.html` (or `/`).
- **Render (Backend):** Deployed as a web service. CORS is configured to accept requests specifically from the Vercel domain, enabling `credentials: true` for Socket.io polling and WebSocket upgrades.

*Built for Queue Cure '26 — Wooble Software Private Limited*
