const PRIORITY_STYLES = {
  critical: "bg-brick-100 text-brick-600 border-brick-600/30",
  high: "bg-amber-100 text-amber-600 border-amber-600/30",
  medium: "bg-ink-100 text-ink-700 border-ink-300/60",
  low: "bg-moss-100 text-moss-600 border-moss-600/30",
};

const STATUS_STYLES = {
  pending: "bg-ink-100 text-ink-700",
  acknowledged: "bg-amber-100 text-amber-600",
  in_progress: "bg-amber-100 text-amber-600",
  resolved: "bg-moss-100 text-moss-600",
  rejected: "bg-brick-100 text-brick-600",
};

export function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-semibold tracking-wide ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const label = status.replace("_", " ");
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {label}
    </span>
  );
}
