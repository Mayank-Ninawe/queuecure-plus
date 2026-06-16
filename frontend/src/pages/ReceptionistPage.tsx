import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQueue, formatMs } from "../hooks/useQueue";
import Logo from "../components/Logo";
import ConnectionBanner from "../components/ConnectionBanner";
import StatsBar from "../components/StatsBar";
import AddPatientForm from "../components/AddPatientForm";
import QueueList from "../components/QueueList";
import ActionButtons from "../components/ActionButtons";
import AvgTimeEditor from "../components/AvgTimeEditor";
import ConfirmModal from "../components/ConfirmModal";
import ErrorToast from "../components/ErrorToast";
import OperationalSummaryStrip from "../components/OperationalSummaryStrip";
import { Patient } from "../lib/types";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
}

const INITIAL_CONFIRM: ConfirmState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "",
  confirmColor: "var(--color-error)",
  onConfirm: () => {},
};

export default function ReceptionistPage() {
  const {
    patients,
    stats,
    connectionStatus,
    lastError,
    isLoading,
    waitingPatients,
    calledPatient,
    inConsultationPatient,
    addPatient,
    callNext,
    startConsultation,
    completeConsultation,
    skipPatient,
    cancelPatient,
    updateAvgTime,
    clearError,
  } = useQueue();

  const [confirm, setConfirm] = useState<ConfirmState>(INITIAL_CONFIRM);

  const closeConfirm = useCallback(() => setConfirm(INITIAL_CONFIRM), []);

  // Wrap destructive actions behind ConfirmModal
  const handleSkip = useCallback(
    (patientId: string) => {
      const p = patients.find((x: Patient) => x.id === patientId);
      setConfirm({
        open: true,
        title: "Skip patient?",
        description: `Token #${p?.tokenNumber} (${p?.name}) will be moved to skipped status. They won't be called again unless re-added.`,
        confirmLabel: "Skip",
        confirmColor: "var(--color-status-skipped)",
        onConfirm: () => { skipPatient(patientId); closeConfirm(); },
      });
    },
    [patients, skipPatient, closeConfirm]
  );

  const handleCancel = useCallback(
    (patientId: string) => {
      const p = patients.find((x: Patient) => x.id === patientId);
      setConfirm({
        open: true,
        title: "Cancel patient?",
        description: `Token #${p?.tokenNumber} (${p?.name}) will be permanently cancelled. This cannot be undone.`,
        confirmLabel: "Cancel Patient",
        confirmColor: "var(--color-error)",
        onConfirm: () => { cancelPatient(patientId); closeConfirm(); },
      });
    },
    [patients, cancelPatient, closeConfirm]
  );

  // Show all patients sorted: active first, then completed/skipped/cancelled
  const sortedPatients = [...patients].sort((a, b) => a.tokenNumber - b.tokenNumber);

  return (
    <>
      <ConnectionBanner status={connectionStatus} />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          minHeight: "100dvh",
          background: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "var(--space-4) var(--space-8)",
            borderBottom: "1.5px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            background: "var(--color-surface)",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Logo size={30} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "var(--text-base)",
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
            }}
          >
            QueueCure<span style={{ color: "var(--color-primary)" }}>+</span>
          </span>
          <span
            style={{
              marginLeft: "var(--space-2)",
              fontSize: "10px",
              color: "var(--color-text-muted)",
              padding: "3px var(--space-3)",
              background: "var(--color-surface-3)",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            Reception Console
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
            {stats && (
              <AvgTimeEditor
                currentAvgMs={stats.avgConsultationMs}
                onSave={updateAvgTime}
              />
            )}
            <a
              href="/waiting-room"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-primary)",
                fontWeight: 700,
                textDecoration: "none",
                padding: "var(--space-2) var(--space-4)",
                border: "1.5px solid var(--color-primary)",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                letterSpacing: "0.02em",
                boxShadow: "var(--shadow-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-primary-dim)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              Open Waiting Room ↗
            </a>
          </div>
        </header>

        {/* Operational Summary Strip */}
        <div
          style={{
            maxWidth: "var(--content-wide)",
            width: "100%",
            margin: "0 auto",
            padding: "var(--space-8) var(--space-8) 0 var(--space-8)",
          }}
        >
          <OperationalSummaryStrip
            waitingPatients={waitingPatients}
            stats={stats}
          />
        </div>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            maxWidth: "var(--content-wide)",
            width: "100%",
            margin: "0 auto",
            padding: "var(--space-8)",
            display: "grid",
            gridTemplateColumns: "1.1fr 2fr",
            gap: "var(--space-8)",
            alignItems: "start",
          }}
        >
          {/* Left column: stats + add form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", position: "sticky", top: "calc(74px + var(--space-8))" }}>
            <StatsBar stats={stats} />
            <AddPatientForm
              onAdd={(name, phone, priorityFlag) => addPatient({ name, phone, priorityFlag })}
              disabled={connectionStatus !== "connected"}
            />
          </div>

          {/* Right column: action buttons + queue list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <ActionButtons
              waitingCount={waitingPatients.length}
              calledPatient={calledPatient}
              inConsultationPatient={inConsultationPatient}
              onCallNext={callNext}
              onStart={startConsultation}
              onComplete={completeConsultation}
              disabled={connectionStatus !== "connected"}
            />

            {/* Queue header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid var(--color-border)", paddingBottom: "var(--space-2)" }}>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-base)",
                fontWeight: 700,
                color: "var(--color-text)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
              }}>
                <span style={{ width: 4, height: 16, background: "var(--color-primary)", borderRadius: "var(--radius-full)" }} />
                Patient Queue — {patients.length} total
              </h2>
              {stats && stats.avgConsultationMs > 0 && (
                <span className="tabular" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", fontWeight: 500 }}>
                  EMA Average: {formatMs(stats.avgConsultationMs)} / patient
                </span>
              )}
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 74, borderRadius: "var(--radius-lg)" }} />
                ))}
              </div>
            ) : (
              <QueueList
                patients={sortedPatients}
                stats={stats}
                onStart={startConsultation}
                onComplete={completeConsultation}
                onSkip={handleSkip}
                onCancel={handleCancel}
              />
            )}
          </div>
        </main>

        {/* Responsive: stack columns on mobile */}
        <style>{`
          @media (max-width: 868px) {
            main { grid-template-columns: 1fr !important; gap: var(--space-6) !important; }
            main > div:first-child { position: static !important; }
          }
        `}</style>
      </motion.div>

      {/* Confirm modal for destructive actions */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel}
        confirmColor={confirm.confirmColor}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Error toast */}
      <ErrorToast message={lastError} onDismiss={clearError} />
    </>
  );
}