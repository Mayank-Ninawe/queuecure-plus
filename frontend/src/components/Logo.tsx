export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-label="QueueCure+ logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Queue lines — 3 horizontal bars suggesting a queue */}
      <rect x="4" y="10" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
      <rect x="4" y="18" width="26" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="4" y="26" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
      {/* Plus mark — top right, amber */}
      <rect x="31" y="5" width="3" height="11" rx="1.5" fill="var(--color-primary)" />
      <rect x="26" y="10" width="11" height="3" rx="1.5" fill="var(--color-primary)" />
    </svg>
  );
}