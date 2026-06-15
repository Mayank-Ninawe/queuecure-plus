# QueueCure+ 🏥

> A deterministic, concurrency-safe queue engine for Indian clinics —
> with live receptionist–patient sync and wait times computed from real
> consultation data.

Built for **Queue Cure '26** hosted by Wooble Software Private Limited.

---

## Live Demo

| Screen | URL |
|---|---|
| Receptionist | `https://your-app.vercel.app/reception` |
| Waiting Room | `https://your-app.vercel.app/waiting-room` |

---

## What It Does

- **Receptionist view** — Add patients, call next token, start/complete/skip consultations
- **Patient display** — Live current token, tokens ahead, estimated wait (from real data)
- **Live sync** — Both screens update instantly via Socket.io — no refresh needed
- **Real wait times** — Computed from actual consultation durations using EMA, never hardcoded
- **Concurrency-safe** — Guards against double-calls, multi-tab receptionists, and reconnects

---

## Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | React + TypeScript + Vite | Vercel (free) |
| Backend | Node.js + Express + Socket.io | Render (free) |
| Styling | CSS Variables + Framer Motion | — |
| Animations | GSAP | — |

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Backend

```bash
cd backend
npm install
cp .env.example .env    # set PORT=4001
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# create .env.local:
echo "VITE_SOCKET_URL=http://localhost:4001" > .env.local
npm run dev
```

Open:
- Receptionist: `http://localhost:5173/reception`
- Waiting Room:  `http://localhost:5173/waiting-room`

---

## Repo Structure
queuecure-plus/
├── backend/
│ └── src/
│ ├── index.ts # Express + Socket.io entry
│ ├── queueEngine.ts # Pure state machine functions
│ ├── events.ts # Socket event wiring
│ └── types.ts # Shared TypeScript types
├── frontend/
│ └── src/
│ ├── components/ # UI components
│ ├── hooks/useQueue.ts # Socket.io + queue state
│ ├── lib/types.ts # TypeScript interfaces
│ └── pages/ # ReceptionistPage, PatientDisplayPage
└── docs/
├── thought-process.md
├── socket-events-diagram.png
└── requirements.md


---

## Evaluation Rubric Mapping

| Criteria | Weight | How We Address It |
|---|---|---|
| Live queue updates without refresh | 40% | Socket.io broadcasts `queue:sync` to all clients after every state change |
| Wait time from real data | 25% | EMA of actual `completedAt − startedAt` durations per session |
| Receptionist screen fast + mistake-proof | 20% | Keyboard shortcuts, confirm modals for destructive actions, disabled buttons during invalid states |
| Thought process — concurrency + edge cases | 15% | See `docs/thought-process.md` |

---

## Docs

- [Thought Process](./docs/thought-process.md)
- [Socket Events Diagram](./docs/socket-events-diagram.png)