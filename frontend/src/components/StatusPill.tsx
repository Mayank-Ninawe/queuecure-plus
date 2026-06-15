import { PatientStatus } from "../lib/types";

const STATUS_CONFIG: Record<
  PatientStatus,
  { label: string; color: string; bg: string }
> = {
  [PatientStatus.WAITING]: {
    label: "Waiting",
    color: "var(--color-status-waiting)",
    bg: "var(--color-status-waiting-dim)",
  },
  [PatientStatus.CALLED]: {
    label: "Called",
    color: "var(--color-status-called)",
    bg: "var(--color-status-called-dim)",
  },
  [PatientStatus.IN_CONSULTATION]: {
    label: "In Consult",
    color: "var(--color-status-consultation)",
    bg: "var(--color-status-consultation-dim)",
  },
  [PatientStatus.COMPLETED]: {
    label: "Done",
    color: "var(--color-status-completed)",
    bg: "var(--color-status-completed-dim)",
  },
  [PatientStatus.SKIPPED]: {
    label: "Skipped",
    color: "var(--color-status-skipped)",
    bg: "var(--color-status-skipped-dim)",
  },
  [PatientStatus.CANCELLED]: {
    label: "Cancelled",
    color: "var(--color-status-cancelled)",
    bg: "var(--color-status-cancelled-dim)",
  },
};

interface Props {
  status: PatientStatus;
}

export default function StatusPill({ status }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="status-pill"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}