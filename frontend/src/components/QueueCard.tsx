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
      ? "var(--color-status-consultation-dim)"
      : patient.status === PatientStatus.CALLED
      ? "var(--color-status-called-dim)"
      : "var(--color-surface)",
    border: `1.5px solid ${
      patient.status === PatientStatus.IN_CONSULTATION
        ? "var(--color-status-consultation)"
        : patient.status === PatientStatus.CALLED
        ? "var(--color-status-called)"
        : "var(--color-border)"
    }`,
    borderLeft: `4px solid ${
      patient.status === PatientStatus.IN_CONSULTATION
        ? "var(--color-status-consultation)"
        : patient.status === PatientStatus.CALLED
        ? "var(--color-status-called)"
        : patient.status === PatientStatus.WAITING
        ? "var(--color-primary)"
        : patient.status === PatientStatus.COMPLETED
        ? "var(--color-status-completed)"
        : patient.status === PatientStatus.SKIPPED
        ? "var(--color-status-skipped)"
        : "var(--color-status-cancelled)"
    }`,
    boxShadow: "var(--shadow-sm)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-3) var(--space-5)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-4)",
    opacity: isActive ? 1 : 0.65,
    transition: "all var(--transition-base)",
  };

  const btnBase: React.CSSProperties = {
    padding: "var(--space-1) var(--space-3)",
    minHeight: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--color-border)",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    transition: "all var(--transition-fast)",
    background: "var(--color-surface)",
  };

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      onMouseEnter={(e) => {
        if (isActive) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
        }
      }}
      onMouseLeave={(e) => {
        if (isActive) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        }
      }}
    >
      {/* Token number */}
      <div
        className="tabular"
        style={{
          width: 42,
          height: 42,
          borderRadius: "var(--radius-md)",
          background: patient.priorityFlag ? "var(--color-status-called-dim)" : "var(--color-surface-3)",
          border: `1.5px solid ${patient.priorityFlag ? "var(--color-warning)" : "var(--color-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-base)",
          color: patient.priorityFlag ? "var(--color-warning)" : "var(--color-text)",
          flexShrink: 0,
          boxShadow: patient.priorityFlag ? "inset 0 1px 2px rgba(178,94,2,0.06)" : "none",
        }}
      >
        {patient.tokenNumber}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "2px" }}>
          <span style={{
            fontWeight: 700,
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
              fontSize: "9px",
              color: "var(--color-warning)",
              background: "var(--color-status-called-dim)",
              padding: "1px 6px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(178,94,2,0.2)",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Priority
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <StatusPill status={patient.status} />
          {patient.status === PatientStatus.WAITING && patientStat && (
            <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-text-muted)" }}>
              {patientStat.tokensAhead === 0
                ? "Next up"
                : `•  ~${formatWait(patientStat.estimatedWaitMs)} wait`}
            </span>
          )}
          {patient.phone && (
            <span className="tabular" style={{ fontSize: "11px", color: "var(--color-text-faint)" }}>
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
              style={{ ...btnBase, color: "var(--color-success)", borderColor: "var(--color-success)", background: "var(--color-success-dim)" }}
              title="Start consultation"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-success)";
                e.currentTarget.style.color = "var(--color-text-inverse)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-success-dim)";
                e.currentTarget.style.color = "var(--color-success)";
              }}
            >
              Start
            </button>
          )}
          {patient.status === PatientStatus.IN_CONSULTATION && (
            <button
              onClick={() => onComplete(patient.id)}
              style={{ ...btnBase, color: "var(--color-success)", borderColor: "var(--color-success)", background: "var(--color-success-dim)" }}
              title="Mark complete"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-success)";
                e.currentTarget.style.color = "var(--color-text-inverse)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-success-dim)";
                e.currentTarget.style.color = "var(--color-success)";
              }}
            >
              Complete ✓
            </button>
          )}
          {(patient.status === PatientStatus.WAITING || patient.status === PatientStatus.CALLED) && (
            <button
              onClick={() => onSkip(patient.id)}
              style={{ ...btnBase, color: "var(--color-status-skipped)", borderColor: "var(--color-status-skipped-dim)" }}
              title="Skip patient"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-status-skipped)";
                e.currentTarget.style.color = "var(--color-text-inverse)";
                e.currentTarget.style.borderColor = "var(--color-status-skipped)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-surface)";
                e.currentTarget.style.color = "var(--color-status-skipped)";
                e.currentTarget.style.borderColor = "var(--color-status-skipped-dim)";
              }}
            >
              Skip
            </button>
          )}
          <button
            onClick={() => onCancel(patient.id)}
            style={{ ...btnBase, color: "var(--color-error)", borderColor: "var(--color-error-dim)", padding: "var(--space-1) var(--space-2)" }}
            title="Cancel"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-error)";
              e.currentTarget.style.color = "var(--color-text-inverse)";
              e.currentTarget.style.borderColor = "var(--color-error)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-surface)";
              e.currentTarget.style.color = "var(--color-error)";
              e.currentTarget.style.borderColor = "var(--color-error-dim)";
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}