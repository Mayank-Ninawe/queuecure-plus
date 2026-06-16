import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface Props {
  tokenNumber: number | null;
  label: string;
  size?: "large" | "medium";
  color?: string;
  glowColor?: string;
}

export default function TokenDisplay({
  tokenNumber,
  label,
  size = "large",
  color = "var(--color-primary)",
  glowColor = "var(--shadow-amber-lg)",
}: Props) {
  const numRef = useRef<HTMLDivElement>(null);
  const prevToken = useRef<number | null>(null);

  // GSAP flip animation whenever token number changes
  useEffect(() => {
    if (!numRef.current) return;
    if (prevToken.current === tokenNumber) return;

    prevToken.current = tokenNumber;

    gsap.fromTo(
      numRef.current,
      { scale: 1.18, opacity: 0, y: -12 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.4)",
        clearProps: "transform",
      }
    );
  }, [tokenNumber]);

  const isLarge = size === "large";

  return (
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
        {label}
      </p>

      <div
        className="tactile-card"
        style={{
          width: isLarge ? "clamp(180px, 20vw, 240px)" : "clamp(120px, 12vw, 160px)",
          height: isLarge ? "clamp(180px, 20vw, 240px)" : "clamp(120px, 12vw, 160px)",
          borderRadius: "var(--radius-2xl)",
          background: "var(--color-surface)",
          border: `3px solid ${tokenNumber != null ? color : "var(--color-border)"}`,
          boxShadow: tokenNumber != null
            ? `var(--shadow-md), ${glowColor}`
            : "var(--shadow-sm), inset 0 2px 4px rgba(35, 38, 41, 0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all var(--transition-slow)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow inside box simulating backlit screen */}
        {tokenNumber != null && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 45%, ${color}12 0%, transparent 75%)`,
              pointerEvents: "none",
            }}
          />
        )}

        <div
          ref={numRef}
          className="tabular"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: isLarge
              ? "clamp(4rem, 8vw, 7rem)"
              : "clamp(2.25rem, 5vw, 4rem)",
            color: tokenNumber != null ? color : "var(--color-text-faint)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          {tokenNumber ?? "—"}
        </div>
      </div>
    </div>
  );
}