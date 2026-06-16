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
    padding: "var(--space-4) var(--space-8)",
    minHeight: "44px",
    minWidth: "44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-lg)",
    border: "none",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "var(--text-base)",
    cursor: canCallNext ? "pointer" : "not-allowed",
    background: canCallNext ? "var(--color-primary)" : "var(--color-surface-3)",
    color: canCallNext ? "var(--color-text-inverse)" : "var(--color-text-faint)",
    transition: "background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)",
    boxShadow: canCallNext ? "var(--shadow-amber)" : "none",
    letterSpacing: "0.02em",
  };

  const secondaryBtn = (active: boolean, color: string): React.CSSProperties => ({
    padding: "var(--space-3) var(--space-6)",
    minHeight: "44px",
    minWidth: "44px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    border: `1px solid ${active ? color : "var(--color-border)"}`,
    background: active ? `${color}18` : "transparent",
    color: active ? color : "var(--color-text-faint)",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: "var(--text-sm)",
    cursor: active ? "pointer" : "not-allowed",
    transition: "all var(--transition-fast)",
    letterSpacing: "0.02em",
  });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        alignItems: "center",
        padding: "var(--space-5) var(--space-6)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      {/* Call Next — primary action */}
      <button
        onClick={onCallNext}
        disabled={!canCallNext}
        style={primaryBtn}
        title="Call next patient [Space]"
        onMouseEnter={(e) => { if (canCallNext) (e.currentTarget.style.boxShadow = "var(--shadow-amber-lg)"); }}
        onMouseLeave={(e) => { (e.currentTarget.style.boxShadow = canCallNext ? "var(--shadow-amber)" : "none"); }}
      >
        Call Next
        <span style={{ marginLeft: "var(--space-2)", fontSize: "var(--text-xs)", fontWeight: 400, opacity: 0.7 }}>
          [Space]
        </span>
      </button>

      {/* Start Consultation */}
      <button
        onClick={() => calledPatient && onStart(calledPatient.id)}
        disabled={!canStart}
        style={secondaryBtn(canStart, "var(--color-success)")}
        title={`Start consultation${calledPatient ? ` for #${calledPatient.tokenNumber}` : ""} [S]`}
      >
        Start [S]
      </button>

      {/* Complete Consultation */}
      <button
        onClick={() => inConsultationPatient && onComplete(inConsultationPatient.id)}
        disabled={!canComplete}
        style={secondaryBtn(canComplete, "var(--color-info)")}
        title={`Mark complete${inConsultationPatient ? ` for #${inConsultationPatient.tokenNumber}` : ""} [C]`}
      >
        Complete [C]
      </button>

      {/* Shortcut hint */}
      <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--color-text-faint)" }}>
        Alt+N to focus name field
      </span>
    </div>
  );
}