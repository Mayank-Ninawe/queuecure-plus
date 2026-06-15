import { motion } from "framer-motion";
import { useQueue } from "../hooks/useQueue";

const pageVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 1.02, transition: { duration: 0.2 } },
};

export default function PatientDisplayPage() {
  const { connectionStatus, stats } = useQueue();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        gap: "var(--space-6)",
      }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)", fontSize: "var(--text-xl)" }}>
        QueueCure+ — Waiting Room
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Now serving:{" "}
        <strong style={{ color: "var(--color-text)", fontSize: "var(--text-lg)" }}>
          {stats?.currentToken ?? "—"}
        </strong>
      </p>
      <p style={{ color: "var(--color-text-muted)" }}>
        Socket: <strong style={{ color: connectionStatus === "connected" ? "var(--color-success)" : "var(--color-error)" }}>
          {connectionStatus}
        </strong>
      </p>
      <p style={{ color: "var(--color-text-faint)", fontSize: "var(--text-sm)" }}>
        Phase 5 — 3D token cube + live wait counter coming →
      </p>
    </motion.div>
  );
}