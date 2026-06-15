import { useState } from "react";

interface Props {
  currentAvgMs: number;
  onSave: (ms: number) => void;
}

export default function AvgTimeEditor({ currentAvgMs, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Math.round(currentAvgMs / 60000)));

  function handleSave() {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onSave(minutes * 60000);
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title="Click to manually set average consultation time"
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          textDecoration: "underline dotted",
          textUnderlineOffset: "3px",
          background: "none",
          border: "none",
        }}
      >
        Override avg time
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      <input
        type="number"
        min={1}
        max={120}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
        autoFocus
        style={{
          width: 64,
          padding: "var(--space-1) var(--space-2)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--color-primary)",
          background: "var(--color-surface-3)",
          color: "var(--color-text)",
          fontSize: "var(--text-sm)",
          textAlign: "center",
        }}
      />
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>min</span>
      <button
        onClick={handleSave}
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-primary)",
          fontWeight: 600,
          background: "none",
          border: "none",
        }}
      >
        Save
      </button>
      <button
        onClick={() => setEditing(false)}
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-faint)",
          background: "none",
          border: "none",
        }}
      >
        Cancel
      </button>
    </div>
  );
}