import { motion } from "framer-motion";
import { useQueue } from "../hooks/useQueue";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function ReceptionistPage() {
  const { connectionStatus, stats, waitingPatients } = useQueue();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: "100dvh", padding: "var(--space-8)", background: "var(--color-bg)" }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)", marginBottom: "var(--space-4)" }}>
        QueueCure+ — Receptionist
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Status: <strong style={{ color: connectionStatus === "connected" ? "var(--color-success)" : "var(--color-error)" }}>
          {connectionStatus}
        </strong>
      </p>
      <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
        Waiting: {stats?.waitingCount ?? "—"} | Avg time: {stats ? Math.round(stats.avgConsultationMs / 60000) + " min" : "—"}
      </p>
      <p style={{ color: "var(--color-text-faint)", marginTop: "var(--space-8)", fontSize: "var(--text-sm)" }}>
        Phase 4 UI coming next →
      </p>
    </motion.div>
  );
}

