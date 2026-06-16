import { Patient, QueueStats } from "../lib/types";
import { formatMs } from "../hooks/useQueue";

interface OperationalSummaryStripProps {
  waitingPatients: Patient[];
  stats: QueueStats | null;
}

export default function OperationalSummaryStrip({
  waitingPatients,
  stats,
}: OperationalSummaryStripProps) {
  const waitingCount = waitingPatients.length;
  const avgConsultationMs = stats?.avgConsultationMs ?? 0;
  const queueClearanceMs = waitingCount * avgConsultationMs;
  const priorityCount = waitingPatients.filter((p) => p.priorityFlag).length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "var(--space-4)",
        width: "100%",
        marginBottom: "var(--space-4)",
      }}
    >
      {/* 1. Patients Waiting Card */}
      <div
        className="tactile-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-5) var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--color-primary)" }} />
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
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: "var(--color-text)",
            lineHeight: 1.1,
            margin: "var(--space-1) 0",
          }}
        >
          {waitingCount}
        </span>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
            fontWeight: 500,
          }}
        >
          currently in active queue
        </span>
      </div>

      {/* 2. Avg Consultation Card */}
      <div
        className="tactile-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-5) var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--color-info)" }} />
        <span
          style={{
            fontSize: "10px",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          Avg Consultation
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: avgConsultationMs > 0 ? "var(--color-info)" : "var(--color-text-faint)",
            lineHeight: 1.1,
            margin: "var(--space-1) 0",
          }}
        >
          {avgConsultationMs > 0 ? formatMs(avgConsultationMs) : "Calculating..."}
        </span>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
            fontWeight: 500,
          }}
        >
          moving average duration
        </span>
      </div>

      {/* 3. Estimated Queue Clearance Card */}
      <div
        className="tactile-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-5) var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--color-warning)" }} />
        <span
          style={{
            fontSize: "10px",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          Queue Clearance
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: avgConsultationMs > 0 ? "var(--color-warning)" : "var(--color-text-faint)",
            lineHeight: 1.1,
            margin: "var(--space-1) 0",
          }}
        >
          {avgConsultationMs > 0 ? formatMs(queueClearanceMs) : "Calculating..."}
        </span>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
            fontWeight: 500,
          }}
        >
          est. time to empty queue
        </span>
      </div>

      {/* 4. Priority Patients Card */}
      <div
        className="tactile-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-5) var(--space-6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--color-status-skipped)" }} />
        <span
          style={{
            fontSize: "10px",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          Priority Patients
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: priorityCount > 0 ? "var(--color-status-skipped)" : "var(--color-text)",
            lineHeight: 1.1,
            margin: "var(--space-1) 0",
          }}
        >
          {priorityCount}
        </span>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
            fontWeight: 500,
          }}
        >
          senior & emergency tokens
        </span>
      </div>
    </div>
  );
}
