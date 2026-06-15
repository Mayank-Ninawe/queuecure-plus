import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmColor = "var(--color-error)",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 100,
            }}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-8)",
              width: "min(420px, 90vw)",
              zIndex: 101,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h3
              id="modal-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                color: "var(--color-text)",
                marginBottom: "var(--space-3)",
              }}
            >
              {title}
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
              {description}
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button
                onClick={onCancel}
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                  background: "transparent",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: confirmColor,
                  color: "#fff",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}