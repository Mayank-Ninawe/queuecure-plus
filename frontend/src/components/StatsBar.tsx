import { QueueStats } from "../lib/types";
import { formatMs } from "../hooks/useQueue";

interface Props {
  stats: QueueStats | null;
}

function StatItem({ label, value, showBorder = true }: { label: string; value: string; showBorder?: boolean }) {
  return (
    <div style={{
      textAlign: "center",
      borderRight: showBorder ? "1.5px solid var(--color-divider)" : "none",
      paddingRight: showBorder ? "var(--space-2)" : 0,
    }}>
      <div
        className="tabular"
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 800,
          fontFamily: "var(--font-display)",
          color: "var(--color-primary)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--color-text-muted)", marginTop: "var(--space-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
    </div>
  );
}

export default function StatsBar({ stats }: Props) {
  return (
    <div
      className="tactile-card"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--space-2)",
        padding: "var(--space-5) var(--space-4)",
      }}
    >
      <StatItem
        label="Waiting"
        value={stats ? String(stats.waitingCount) : "—"}
      />
      <StatItem
        label="Avg Time"
        value={stats ? (stats.avgConsultationMs ? formatMs(stats.avgConsultationMs) : "—") : "—"}
      />
      <StatItem
        label="Now Serving"
        value={stats?.currentToken != null ? `#${stats.currentToken}` : "—"}
        showBorder={false}
      />
    </div>
  );
}