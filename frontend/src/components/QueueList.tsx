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
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-16) var(--space-8)",
          color: "var(--color-text-faint)",
          textAlign: "center",
          gap: "var(--space-3)",
          border: "1px dashed var(--color-border)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>No patients in queue</p>
        <p style={{ fontSize: "var(--text-xs)" }}>Add a patient above to get started</p>
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