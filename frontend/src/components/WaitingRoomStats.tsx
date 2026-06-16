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
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-xl)",
    minWidth: 120,
    flex: 1,
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 640,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      {/* Live stats row */}
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div style={rowStyle}>
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)",
              fontWeight: 800,
              color: "var(--color-text)",
              lineHeight: 1,
            }}
          >
            {stats?.waitingCount ?? "—"}
          </span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            Waiting
          </span>
        </div>

        <div style={rowStyle}>
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-2xl)",
              fontWeight: 800,
              color: "var(--color-text)",
              lineHeight: 1,
            }}
          >
            {stats ? (stats.avgConsultationMs ? formatMs(stats.avgConsultationMs) : "Calculating...") : "—"}
          </span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            Avg Per Patient
          </span>
        </div>
      </div>

      {/* Token lookup */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-5) var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          Check your wait time
        </p>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <input
            type="number"
            min={1}
            placeholder="Enter your token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            style={{
              flex: 1,
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              fontSize: "var(--text-base)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              textAlign: "center",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
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
              border: `1px solid ${lookedUp ? "var(--color-primary)" : "var(--color-error)"}`,
              textAlign: "center",
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
                  }}
                >
                  {formatWait(lookedUp.estimatedWaitMs)}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
                  {lookedUp.tokensAhead === 0
                    ? "You're next — please be ready"
                    : `${lookedUp.tokensAhead} patient${lookedUp.tokensAhead > 1 ? "s" : ""} ahead of you`}
                </p>
              </>
            ) : (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-error)", fontWeight: 500 }}>
                Token #{tokenInput} not found in active queue
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}