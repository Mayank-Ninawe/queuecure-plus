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
        gap: "var(--space-3)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
        }}
      >
        {label}
      </p>

      <div
        style={{
          width: isLarge ? "clamp(160px, 20vw, 240px)" : "clamp(100px, 12vw, 140px)",
          height: isLarge ? "clamp(160px, 20vw, 240px)" : "clamp(100px, 12vw, 140px)",
          borderRadius: "var(--radius-2xl)",
          background: "var(--color-surface-2)",
          border: `2px solid ${tokenNumber != null ? color : "var(--color-border)"}`,
          boxShadow: tokenNumber != null ? glowColor : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color var(--transition-slow), box-shadow var(--transition-slow)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow inside box */}
        {tokenNumber != null && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 40%, ${color}18 0%, transparent 70%)`,
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
              ? "clamp(3.5rem, 8vw, 6rem)"
              : "clamp(2rem, 5vw, 3.5rem)",
            color: tokenNumber != null ? color : "var(--color-text-faint)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {tokenNumber ?? "—"}
        </div>
      </div>
    </div>
  );
}