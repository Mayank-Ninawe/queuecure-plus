import { useState } from "react";
import { QueueStats } from "../lib/types";
import { formatWait, formatMs } from "../hooks/useQueue";

interface Props {
  stats: QueueStats | null;
}

export default function WaitingRoomStats({ stats }: Props) {
  const [tokenInput, setTokenInput] = useState("");

  // Look up a specific patient's wait from stats
  const lookedUp = stats?.perPatient.find(
    (p) => p.tokenNumber === parseInt(tokenInput, 10)
  );

  const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--space-1)",
    padding: "var(--space-5) var(--space-6)",
    minWidth: 120,
    flex: 1,
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 640,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
      }}
    >
      {/* Live stats row */}
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", width: "100%" }}>
        <div className="tactile-card" style={rowStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--color-primary)" }} />
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 800,
              color: "var(--color-text)",
              lineHeight: 1.1,
              margin: "var(--space-1) 0",
            }}
          >
            {stats?.waitingCount ?? "0"}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            Patients Waiting
          </span>
        </div>

        <div className="tactile-card" style={rowStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--color-info)" }} />
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: 800,
              color: "var(--color-text)",
              lineHeight: 1.1,
              margin: "var(--space-1) 0",
            }}
          >
            {stats ? (stats.avgConsultationMs ? formatMs(stats.avgConsultationMs) : "Calculating...") : "—"}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            Avg Wait Per Visit
          </span>
        </div>
      </div>

      {/* Token lookup */}
      <div
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
          <span style={{ fontSize: "1.1rem" }}>🔍</span>
          <p
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            Estimated Wait-Time Calculator
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <input
            type="number"
            min={1}
            placeholder="Enter Your Token Number"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            style={{
              flex: 1,
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--color-border)",
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              fontSize: "var(--text-base)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
              boxShadow: "inset 0 1px 2px rgba(35, 38, 41, 0.02)",
              transition: "all var(--transition-fast)",
            }}
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

        {/* Result */}
        {tokenInput && (
          <div
            style={{
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
              background: lookedUp
                ? "var(--color-primary-dim)"
                : "var(--color-error-dim)",
              border: `1.5px solid ${lookedUp ? "var(--color-primary)" : "var(--color-error)"}`,
              textAlign: "center",
              transition: "all var(--transition-base)",
            }}
          >
            {lookedUp ? (
              <>
                <p
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-xl)",
                    fontWeight: 800,
                    color: "var(--color-primary)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  ~ {formatWait(lookedUp.estimatedWaitMs)}
                </p>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-muted)", marginTop: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                  {lookedUp.tokensAhead === 0
                    ? "🏥 You are next in line — Please proceed to doctor's office"
                    : `⏳ There ${lookedUp.tokensAhead > 1 ? "are" : "is"} ${lookedUp.tokensAhead} patient${lookedUp.tokensAhead > 1 ? "s" : ""} ahead of you`}
                </p>
              </>
            ) : (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-error)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Token #{tokenInput} is not currently active in the queue
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}