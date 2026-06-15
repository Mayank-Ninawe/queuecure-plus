import { motion, AnimatePresence } from "framer-motion";

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorToast({ message, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            bottom: "var(--space-6)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-error-dim)",
            border: "1px solid var(--color-error)",
            color: "var(--color-error)",
            padding: "var(--space-3) var(--space-6)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            boxShadow: "var(--shadow-lg)",
            whiteSpace: "nowrap",
          }}
        >
          <span>⚠ {message}</span>
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            style={{
              color: "var(--color-error)",
              opacity: 0.7,
              fontSize: "var(--text-base)",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}