import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectionStatus } from "../lib/types";

interface Props {
  status: ConnectionStatus;
}

const config: Record<ConnectionStatus, { label: string; bg: string; color: string } | null> = {
  connected: null, // no banner when connected
  connecting: {
    label: "Connecting to server…",
    bg: "var(--color-surface-3)",
    color: "var(--color-text-muted)",
  },
  disconnected: {
    label: "⚠ Disconnected — trying to reconnect…",
    bg: "var(--color-warning-dim)",
    color: "var(--color-warning)",
  },
  error: {
    label: "✕ Connection error — check if backend is running",
    bg: "var(--color-error-dim)",
    color: "var(--color-error)",
  },
};

export default function ConnectionBanner({ status }: Props) {
  const [showColdStart, setShowColdStart] = useState(false);

  useEffect(() => {
    if (status === "connecting" || status === "error") {
      const timer = setTimeout(() => {
        setShowColdStart(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    } else {
      setShowColdStart(false);
    }
  }, [status]);

  const cfg = config[status];

  return (
    <AnimatePresence>
      {(cfg || (showColdStart && status !== "connected")) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden" }}
        >
          {showColdStart && status !== "connected" && (
            <div
              style={{
                background: "var(--color-warning-dim)",
                color: "var(--color-warning)",
                textAlign: "center",
                padding: "var(--space-2) var(--space-4)",
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                borderBottom: "1.5px solid var(--color-border)",
              }}
            >
              ⏳ Backend is waking up, please wait ~15 seconds...
            </div>
          )}
          {cfg && (
            <div
              style={{
                background: cfg.bg,
                color: cfg.color,
                textAlign: "center",
                padding: "var(--space-2) var(--space-4)",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {cfg.label}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}