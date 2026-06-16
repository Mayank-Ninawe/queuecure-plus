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
    activePatients,
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
            padding: "var(--space-4) var(--space-8)",
            borderBottom: "1.5px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            background: "var(--color-surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Logo size={26} />
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
            Patient waiting board
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
                    ? "0 0 8px var(--color-success)"
                    : "none",
                animation:
                  connectionStatus === "connected"
                    ? "pulse 2s ease-in-out infinite"
                    : "none",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                color:
                  connectionStatus === "connected"
                    ? "var(--color-success)"
                    : "var(--color-error)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {connectionStatus === "connected" ? "Live Sync" : "Disconnected"}
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
            padding: "var(--space-12) var(--space-6)",
            gap: "var(--space-10)",
            maxWidth: "var(--content-wide)",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {isLoading ? (
            <div style={{ color: "var(--color-text-faint)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
              Connecting to clinic display queue...
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
                  width: "100%",
                }}
              >
                {activePatients.length === 0 ? (
                  <div
                    className="tactile-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "var(--space-12) var(--space-8)",
                      maxWidth: "460px",
                      width: "100%",
                      textAlign: "center",
                      gap: "var(--space-4)",
                    }}
                  >
                    <span style={{ fontSize: "3rem" }}>🏥</span>
                    <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Queue is Clear
                    </h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                      There are no active patients in the queue right now. Please check in with the receptionist pad.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Now Serving — large */}
                    {nowServingToken !== null ? (
                      <TokenDisplay
                        tokenNumber={nowServingToken}
                        label="Now Serving"
                        size="large"
                        color="var(--color-primary)"
                        glowColor="var(--shadow-amber-lg)"
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "var(--space-4)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--color-text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                          }}
                        >
                          Now Serving
                        </p>
                        <div
                          className="recessed-panel"
                          style={{
                            width: "clamp(180px, 20vw, 240px)",
                            height: "clamp(180px, 20vw, 240px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "var(--space-4)",
                            textAlign: "center",
                          }}
                        >
                          <span style={{ fontSize: "1.8rem", marginBottom: "var(--space-2)" }}>😴</span>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text-muted)" }}>
                            Doctor is currently between sessions
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Called / Next Up — medium */}
                    {calledToken !== null ? (
                      <TokenDisplay
                        tokenNumber={calledToken}
                        label="Please Proceed"
                        size="medium"
                        color="var(--color-status-called)"
                        glowColor="0 8px 24px rgba(178, 94, 2, 0.16)"
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "var(--space-4)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--color-text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                          }}
                        >
                          Please Proceed
                        </p>
                        <div
                          className="recessed-panel"
                          style={{
                            width: "clamp(120px, 12vw, 160px)",
                            height: "clamp(120px, 12vw, 160px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "var(--space-3)",
                            textAlign: "center",
                          }}
                        >
                          <span style={{ fontSize: "1.4rem", marginBottom: "var(--space-1)" }}>⏳</span>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-faint)", textTransform: "uppercase" }}>
                            Waiting for Call
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Alert when a patient is being called */}
              <AnimatePresence>
                {calledToken != null && (
                  <motion.div
                    key="call-alert"
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      background: "var(--color-status-called-dim)",
                      border: "1.5px solid var(--color-status-called)",
                      borderRadius: "var(--radius-xl)",
                      padding: "var(--space-4) var(--space-8)",
                      textAlign: "center",
                      boxShadow: "var(--shadow-md)",
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        background: "var(--color-status-called)",
                        borderRadius: "var(--radius-full)",
                        animation: "pulse 1.2s ease-in-out infinite",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "var(--text-base)",
                        color: "var(--color-status-called)",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Token #{calledToken} — Please proceed to doctor's consultation desk
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats + token lookup */}
              <WaitingRoomStats stats={stats} />

              {/* Recently completed */}
              {recentDone.length > 0 && (
                <div
                  className="tactile-card"
                  style={{
                    width: "100%",
                    maxWidth: 640,
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-3)",
                    padding: "var(--space-5) var(--space-6)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                      borderBottom: "1.5px solid var(--color-divider)",
                      paddingBottom: "var(--space-1)",
                    }}
                  >
                    Recently Completed Consultations
                  </p>
                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", paddingTop: "var(--space-1)" }}>
                    {recentDone.map((p) => (
                      <span
                        key={p.id}
                        className="tabular"
                        style={{
                          padding: "var(--space-1) var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          background: "var(--color-surface-3)",
                          color: "var(--color-text-muted)",
                          fontSize: "var(--text-sm)",
                          fontWeight: 700,
                          border: "1.5px solid var(--color-border)",
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