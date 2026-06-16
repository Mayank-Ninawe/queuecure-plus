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
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "var(--space-4)",
        width: "100%",
        marginBottom: "var(--space-2)",
      }}
    >
      {/* 1. Patients Waiting Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-4) var(--space-5)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
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
            lineHeight: 1.2,
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
          currently in queue
        </span>
      </div>

      {/* 2. Avg Consultation Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-4) var(--space-5)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
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
            lineHeight: 1.2,
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
          based on completed visits
        </span>
      </div>

      {/* 3. Estimated Queue Clearance Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-4) var(--space-5)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
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
            color: avgConsultationMs > 0 ? "var(--color-primary)" : "var(--color-text-faint)",
            lineHeight: 1.2,
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
          for current waiting list
        </span>
      </div>

      {/* 4. Priority Patients Card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
          padding: "var(--space-4) var(--space-5)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
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
            lineHeight: 1.2,
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
          senior/emergency tokens
        </span>
      </div>
    </div>
  );
}
