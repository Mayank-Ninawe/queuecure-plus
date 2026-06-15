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
    border: "1px solid var(--color-border)",
    background: "var(--color-surface-2)",
    color: "var(--color-text)",
    fontSize: "var(--text-sm)",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-base)",
        fontWeight: 600,
        color: "var(--color-text)",
      }}>
        Add Patient
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
        <div>
          <label htmlFor="patient-name" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", display: "block", marginBottom: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Name *
          </label>
          <input
            id="patient-name"
            ref={nameRef}
            type="text"
            placeholder="Patient name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>
        <div>
          <label htmlFor="patient-phone" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", display: "block", marginBottom: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Phone
          </label>
          <input
            id="patient-phone"
            type="tel"
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={disabled}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
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
        }}
      >
        <div
          role="checkbox"
          aria-checked={priority}
          tabIndex={0}
          onClick={() => setPriority((p) => !p)}
          onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") setPriority((p) => !p); }}
          style={{
            width: 40,
            height: 22,
            borderRadius: "var(--radius-full)",
            background: priority ? "var(--color-primary)" : "var(--color-surface-offset)",
            border: "1px solid var(--color-border)",
            position: "relative",
            transition: "background var(--transition-fast)",
            flexShrink: 0,
          }}
        >
          <div style={{
            position: "absolute",
            top: 2,
            left: priority ? 20 : 2,
            width: 16,
            height: 16,
            borderRadius: "var(--radius-full)",
            background: "#fff",
            transition: "left var(--transition-fast)",
            boxShadow: "var(--shadow-sm)",
          }} />
        </div>
        <span style={{ fontSize: "var(--text-sm)", color: priority ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: priority ? 600 : 400 }}>
          Priority (Emergency / Senior)
        </span>
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
          transition: "background var(--transition-fast)",
          alignSelf: "flex-start",
        }}
      >
        Add to Queue ↵
      </button>
    </form>
  );
}