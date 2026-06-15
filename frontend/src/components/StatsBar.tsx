import { QueueStats } from "../lib/types";
import { formatMs } from "../hooks/useQueue";

interface Props {
  stats: QueueStats | null;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        className="tabular"
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          color: "var(--color-primary)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsBar({ stats }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--space-4)",
        padding: "var(--space-5) var(--space-6)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <StatItem
        label="Waiting"
        value={stats ? String(stats.waitingCount) : "—"}
      />
      <StatItem
        label="Avg Time"
        value={stats ? formatMs(stats.avgConsultationMs) : "—"}
      />
      <StatItem
        label="Now Serving"
        value={stats?.currentToken != null ? `#${stats.currentToken}` : "—"}
      />
    </div>
  );
}