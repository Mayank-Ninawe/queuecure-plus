import { useEffect } from "react";
import { Patient } from "../lib/types";

interface Props {
  waitingCount: number;
  calledPatient: Patient | null;
  inConsultationPatient: Patient | null;
  onCallNext: () => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  disabled: boolean;
}

export default function ActionButtons({
  waitingCount,
  calledPatient,
  inConsultationPatient,
  onCallNext,
  onStart,
  onComplete,
  disabled,
}: Props) {
  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip if typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName ?? "")) {
        e.preventDefault();
        if (waitingCount > 0 && !calledPatient) onCallNext();
      }
      if (e.key === "s" || e.key === "S") {
        if (calledPatient) onStart(calledPatient.id);
      }
      if (e.key === "c" || e.key === "C") {
        if (inConsultationPatient) onComplete(inConsultationPatient.id);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [waitingCount, calledPatient, inConsultationPatient, onCallNext, onStart, onComplete]);

  const canCallNext = waitingCount > 0 && !calledPatient && !disabled;
  const canStart = !!calledPatient && !disabled;
  const canComplete = !!inConsultationPatient && !disabled;

  const primaryBtn: React.CSSProperties = {
    padding: "var(--space-3) var(--space-6)",
    minHeight: "46px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    border: "none",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "var(--text-sm)",
    cursor: canCallNext ? "pointer" : "not-allowed",
    background: canCallNext ? "var(--color-primary)" : "var(--color-surface-3)",
    color: canCallNext ? "var(--color-text-inverse)" : "var(--color-text-faint)",
    transition: "all var(--transition-fast)",
    boxShadow: canCallNext ? "var(--shadow-amber)" : "none",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  const secondaryBtn = (active: boolean, color: string, activeDim: string): React.CSSProperties => ({
    padding: "var(--space-3) var(--space-5)",
    minHeight: "46px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    border: `1.5px solid ${active ? color : "var(--color-border)"}`,
    background: active ? activeDim : "transparent",
    color: active ? color : "var(--color-text-faint)",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "var(--text-sm)",
    cursor: active ? "pointer" : "not-allowed",
    transition: "all var(--transition-fast)",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  });

  return (
    <div
      className="tactile-card"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        alignItems: "center",
        padding: "var(--space-5) var(--space-6)",
      }}
    >
      {/* Call Next — primary action */}
      <button
        onClick={onCallNext}
        disabled={!canCallNext}
        style={primaryBtn}
        title="Call next patient [Space]"
        onMouseEnter={(e) => {
          if (canCallNext) {
            e.currentTarget.style.background = "var(--color-primary-hover)";
            e.currentTarget.style.boxShadow = "var(--shadow-amber-lg)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (canCallNext) {
            e.currentTarget.style.background = "var(--color-primary)";
            e.currentTarget.style.boxShadow = "var(--shadow-amber)";
            e.currentTarget.style.transform = "none";
          }
        }}
      >
        Call Next
        <span style={{ marginLeft: "var(--space-2)", fontSize: "10px", fontWeight: 500, opacity: 0.8 }}>
          [Space]
        </span>
      </button>

      {/* Start Consultation */}
      <button
        onClick={() => calledPatient && onStart(calledPatient.id)}
        disabled={!canStart}
        style={secondaryBtn(canStart, "var(--color-success)", "var(--color-success-dim)")}
        title={`Start consultation${calledPatient ? ` for #${calledPatient.tokenNumber}` : ""} [S]`}
        onMouseEnter={(e) => {
          if (canStart) {
            e.currentTarget.style.background = "rgba(12, 106, 67, 0.1)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (canStart) {
            e.currentTarget.style.background = "var(--color-success-dim)";
            e.currentTarget.style.transform = "none";
          }
        }}
      >
        Start [S]
      </button>

      {/* Complete Consultation */}
      <button
        onClick={() => inConsultationPatient && onComplete(inConsultationPatient.id)}
        disabled={!canComplete}
        style={secondaryBtn(canComplete, "var(--color-info)", "var(--color-info-dim)")}
        title={`Mark complete${inConsultationPatient ? ` for #${inConsultationPatient.tokenNumber}` : ""} [C]`}
        onMouseEnter={(e) => {
          if (canComplete) {
            e.currentTarget.style.background = "rgba(26, 95, 180, 0.1)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (canComplete) {
            e.currentTarget.style.background = "var(--color-info-dim)";
            e.currentTarget.style.transform = "none";
          }
        }}
      >
        Complete [C]
      </button>

      {/* Shortcut hint */}
      <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, color: "var(--color-text-faint)", letterSpacing: "0.02em" }}>
        Alt+N to focus check-in pad
      </span>
    </div>
  );
}