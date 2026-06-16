import { useState, useRef, useEffect } from "react";

interface Props {
  onAdd: (name: string, phone: string, priorityFlag: boolean) => void;
  disabled: boolean;
}

export default function AddPatientForm({ onAdd, disabled }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [priority, setPriority] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: focus name field on Alt+N
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        nameRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || disabled) return;
    onAdd(trimmed, phone.trim(), priority);
    setName("");
    setPhone("");
    setPriority(false);
    nameRef.current?.focus();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--space-3) var(--space-4)",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--color-border)",
    background: "var(--color-surface-2)",
    color: "var(--color-text)",
    fontSize: "var(--text-sm)",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(35, 38, 41, 0.02)",
    transition: "all var(--transition-fast)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="tactile-card"
      style={{
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ fontSize: "1.2rem" }}>📝</span>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-base)",
          fontWeight: 700,
          color: "var(--color-text)",
          letterSpacing: "-0.01em",
        }}>
          Patient Check-In Pad
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <div>
          <label htmlFor="patient-name" style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Patient Name *
          </label>
          <input
            id="patient-name"
            ref={nameRef}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
              e.target.style.boxShadow = "0 0 0 3px var(--color-primary-glow), inset 0 1px 2px rgba(35, 38, 41, 0.02)";
              e.target.style.background = "var(--color-surface)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "inset 0 1px 2px rgba(35, 38, 41, 0.02)";
              e.target.style.background = "var(--color-surface-2)";
            }}
          />
        </div>
        <div>
          <label htmlFor="patient-phone" style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", display: "block", marginBottom: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Contact Number
          </label>
          <input
            id="patient-phone"
            type="tel"
            placeholder="10-digit phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
              e.target.style.boxShadow = "0 0 0 3px var(--color-primary-glow), inset 0 1px 2px rgba(35, 38, 41, 0.02)";
              e.target.style.background = "var(--color-surface)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "inset 0 1px 2px rgba(35, 38, 41, 0.02)";
              e.target.style.background = "var(--color-surface-2)";
            }}
          />
        </div>
      </div>

      {/* Priority toggle */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          cursor: "pointer",
          userSelect: "none",
          background: priority ? "rgba(178, 94, 2, 0.03)" : "transparent",
          padding: "var(--space-2)",
          borderRadius: "var(--radius-md)",
          border: `1.5px solid ${priority ? "rgba(178, 94, 2, 0.2)" : "transparent"}`,
          transition: "all var(--transition-fast)",
        }}
      >
        <div
          role="checkbox"
          aria-checked={priority}
          tabIndex={0}
          onClick={() => setPriority((p) => !p)}
          onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") setPriority((p) => !p); }}
          style={{
            width: 44,
            height: 24,
            borderRadius: "var(--radius-full)",
            background: priority ? "var(--color-warning)" : "var(--color-surface-3)",
            border: "1.5px solid var(--color-border)",
            position: "relative",
            transition: "all var(--transition-fast)",
            flexShrink: 0,
          }}
        >
          <div style={{
            position: "absolute",
            top: 2,
            left: priority ? 22 : 2,
            width: 17,
            height: 17,
            borderRadius: "var(--radius-full)",
            background: "#fff",
            transition: "left var(--transition-fast)",
            boxShadow: "var(--shadow-sm)",
          }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "var(--text-sm)", color: priority ? "var(--color-warning)" : "var(--color-text)", fontWeight: 700 }}>
            Priority Enrollment
          </span>
          <span style={{ fontSize: "10px", color: "var(--color-text-faint)" }}>
            For emergency cases, seniors, or disabled patients
          </span>
        </div>
      </label>

      <button
        type="submit"
        disabled={disabled || !name.trim()}
        style={{
          padding: "var(--space-3) var(--space-6)",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: disabled || !name.trim() ? "var(--color-surface-3)" : "var(--color-primary)",
          color: disabled || !name.trim() ? "var(--color-text-faint)" : "var(--color-text-inverse)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          letterSpacing: "0.02em",
          cursor: disabled || !name.trim() ? "not-allowed" : "pointer",
          transition: "all var(--transition-fast)",
          alignSelf: "flex-start",
          boxShadow: disabled || !name.trim() ? "none" : "var(--shadow-amber)",
        }}
        onMouseEnter={(e) => {
          if (!disabled && name.trim()) {
            e.currentTarget.style.background = "var(--color-primary-hover)";
            e.currentTarget.style.boxShadow = "var(--shadow-amber-lg)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && name.trim()) {
            e.currentTarget.style.background = "var(--color-primary)";
            e.currentTarget.style.boxShadow = "var(--shadow-amber)";
            e.currentTarget.style.transform = "none";
          }
        }}
      >
        Add to Queue ↵
      </button>
    </form>
  );
}