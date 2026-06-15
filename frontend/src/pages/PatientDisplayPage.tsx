import { motion, AnimatePresence } from "framer-motion";
import { useQueue } from "../hooks/useQueue";
import Logo from "../components/Logo";
import ConnectionBanner from "../components/ConnectionBanner";
import TokenDisplay from "../components/TokenDisplay";
import WaitingRoomStats from "../components/WaitingRoomStats";
import { PatientStatus } from "../lib/types";

const pageVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

export default function PatientDisplayPage() {
  const {
    patients,
    stats,
    connectionStatus,
    isLoading,
    calledPatient,
    inConsultationPatient,
  } = useQueue();

  // The "now serving" is whoever is IN_CONSULTATION
  // The "next called" is whoever is CALLED (being summoned to room)
  const nowServingToken = inConsultationPatient?.tokenNumber ?? null;
  const calledToken = calledPatient?.tokenNumber ?? null;

  // Recent completions — last 5 completed patients
  const recentDone = [...patients]
    .filter((p) => p.status === PatientStatus.COMPLETED)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    .slice(0, 5);

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
            padding: "var(--space-4) var(--space-6)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            background: "var(--color-surface)",
          }}
        >
          <Logo size={24} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-base)",
              color: "var(--color-text)",
            }}
          >
            QueueCure<span style={{ color: "var(--color-primary)" }}>+</span>
          </span>
          <span
            style={{
              marginLeft: "var(--space-2)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-faint)",
              padding: "2px var(--space-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Waiting Room
          </span>

          {/* Live indicator */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "var(--radius-full)",
                background:
                  connectionStatus === "connected"
                    ? "var(--color-success)"
                    : "var(--color-error)",
                boxShadow:
                  connectionStatus === "connected"
                    ? "0 0 6px var(--color-success)"
                    : "none",
                animation:
                  connectionStatus === "connected"
                    ? "pulse 2s ease-in-out infinite"
                    : "none",
              }}
            />
            <span
              style={{
                fontSize: "var(--text-xs)",
                color:
                  connectionStatus === "connected"
                    ? "var(--color-success)"
                    : "var(--color-error)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {connectionStatus === "connected" ? "Live" : connectionStatus}
            </span>
          </div>
        </header>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8) var(--space-6)",
            gap: "var(--space-10)",
          }}
        >
          {isLoading ? (
            <div style={{ color: "var(--color-text-faint)", fontSize: "var(--text-sm)" }}>
              Connecting…
            </div>
          ) : (
            <>
              {/* Token displays */}
              <div
                style={{
                  display: "flex",
                  gap: "clamp(var(--space-8), 8vw, var(--space-16))",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {/* Now Serving — large */}
                <TokenDisplay
                  tokenNumber={nowServingToken}
                  label="Now Serving"
                  size="large"
                  color="var(--color-primary)"
                  glowColor="var(--shadow-amber-lg)"
                />

                {/* Called / Next Up — medium */}
                <TokenDisplay
                  tokenNumber={calledToken}
                  label="Please Proceed"
                  size="medium"
                  color="var(--color-status-called)"
                  glowColor="0 0 32px rgba(245,158,11,0.25)"
                />
              </div>

              {/* Alert when a patient is being called */}
              <AnimatePresence>
                {calledToken != null && (
                  <motion.div
                    key="call-alert"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{
                      background: "var(--color-primary-dim)",
                      border: "1px solid var(--color-primary)",
                      borderRadius: "var(--radius-xl)",
                      padding: "var(--space-4) var(--space-8)",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "var(--text-lg)",
                        color: "var(--color-primary)",
                      }}
                    >
                      Token #{calledToken} — Please proceed to the doctor's room
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats + token lookup */}
              <WaitingRoomStats stats={stats} />

              {/* Recently completed */}
              {recentDone.length > 0 && (
                <div
                  style={{
                    width: "100%",
                    maxWidth: 640,
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-3)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: 600,
                    }}
                  >
                    Recently Completed
                  </p>
                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                    {recentDone.map((p) => (
                      <span
                        key={p.id}
                        className="tabular"
                        style={{
                          padding: "var(--space-1) var(--space-3)",
                          borderRadius: "var(--radius-full)",
                          background: "var(--color-status-completed-dim)",
                          color: "var(--color-status-completed)",
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        #{p.tokenNumber}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </motion.div>

      {/* Pulse keyframe for live indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </>
  );
}