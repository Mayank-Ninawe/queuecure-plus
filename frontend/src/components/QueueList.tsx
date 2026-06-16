import { Patient, QueueStats } from "../lib/types";
import QueueCard from "./QueueCard";

interface Props {
  patients: Patient[];
  stats: QueueStats | null;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function QueueList({ patients, stats, onStart, onComplete, onSkip, onCancel }: Props) {
  if (patients.length === 0) {
    return (
      <div
        className="recessed-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-12) var(--space-8)",
          color: "var(--color-text-muted)",
          textAlign: "center",
          gap: "var(--space-2)",
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.8 }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-text)", marginTop: "var(--space-2)" }}>No Patients Checked In</p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>The active clinic queue is currently empty. Add patients on the left check-in pad to begin.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {patients.map((patient, index) => (
        <QueueCard
          key={patient.id}
          patient={patient}
          stats={stats}
          index={index}
          onStart={onStart}
          onComplete={onComplete}
          onSkip={onSkip}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}