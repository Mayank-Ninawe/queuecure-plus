/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Patient, PatientStatus, QueueStats } from "../lib/types";
import { formatWait } from "../hooks/useQueue";
import StatusPill from "./StatusPill";

interface Props {
  patient: Patient;
  stats: QueueStats | null;
  index: number;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onCancel: (id: string) => void;
}

const ACTIVE_STATUSES = [
  PatientStatus.WAITING,
  PatientStatus.CALLED,
  PatientStatus.IN_CONSULTATION,
];

export default function QueueCard({ patient, stats, index, onStart, onComplete, onSkip, onCancel }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  // GSAP stagger entrance animation
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        delay: index * 0.05,
        ease: "power3.out",
        clearProps: "transform",
      }
    );
  }, [index]);

  const isActive = ACTIVE_STATUSES.includes(patient.status);
  const patientStat = stats?.perPatient.find((p) => p.patientId === patient.id);

  const cardStyle: React.CSSProperties = {
    background: patient.status === PatientStatus.IN_CONSULTATION
      ? "rgba(16,185,129,0.05)"
      : patient.status === PatientStatus.CALLED
      ? "rgba(245,158,11,0.05)"
      : "var(--glass-bg)",
    border: `1px solid ${
      patient.status === PatientStatus.IN_CONSULTATION
        ? "rgba(16,185,129,0.2)"
        : patient.status === PatientStatus.CALLED
        ? "rgba(245,158,11,0.2)"
        : "var(--glass-border)"
    }`,
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-4) var(--space-5)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    opacity: isActive ? 1 : 0.5,
    transition: "border-color var(--transition-base), background var(--transition-base)",
  };

  const btnBase: React.CSSProperties = {
    padding: "var(--space-2) var(--space-4)",
    minHeight: "44px",
    minWidth: "44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--color-border)",
    fontSize: "var(--text-xs)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background var(--transition-fast), color var(--transition-fast)",
    background: "transparent",
  };

  return (
    <div ref={cardRef} style={cardStyle}>
      {/* Token number */}
      <div
        className="tabular"
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-md)",
          background: patient.priorityFlag ? "var(--color-primary-glow)" : "var(--color-surface-3)",
          border: `1px solid ${patient.priorityFlag ? "var(--color-primary)" : "var(--color-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "var(--text-base)",
          color: patient.priorityFlag ? "var(--color-primary)" : "var(--color-text)",
          flexShrink: 0,
        }}
      >
        {patient.tokenNumber}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
          <span style={{
            fontWeight: 600,
            fontSize: "var(--text-sm)",
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {patient.name}
          </span>
          {patient.priorityFlag && (
            <span style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-primary)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              Priority
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <StatusPill status={patient.status} />
          {patient.status === PatientStatus.WAITING && patientStat && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>
              {patientStat.tokensAhead === 0
                ? "Next up"
                : `~${formatWait(patientStat.estimatedWaitMs)} wait`}
            </span>
          )}
          {patient.phone && (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>
              {patient.phone}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — only for active patients */}
      {isActive && (
        <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {patient.status === PatientStatus.CALLED && (
            <button
              onClick={() => onStart(patient.id)}
              style={{ ...btnBase, color: "var(--color-success)", borderColor: "var(--color-success)" }}
              title="Start consultation"
            >
              Start
            </button>
          )}
          {patient.status === PatientStatus.IN_CONSULTATION && (
            <button
              onClick={() => onComplete(patient.id)}
              style={{ ...btnBase, color: "var(--color-success)", borderColor: "var(--color-success)", background: "var(--color-success-dim)" }}
              title="Mark complete"
            >
              Complete ✓
            </button>
          )}
          {(patient.status === PatientStatus.WAITING || patient.status === PatientStatus.CALLED) && (
            <button
              onClick={() => onSkip(patient.id)}
              style={{ ...btnBase, color: "var(--color-status-skipped)" }}
              title="Skip patient"
            >
              Skip
            </button>
          )}
          <button
            onClick={() => onCancel(patient.id)}
            style={{ ...btnBase, color: "var(--color-error)" }}
            title="Cancel"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}