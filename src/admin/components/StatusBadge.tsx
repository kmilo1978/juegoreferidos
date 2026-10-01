export type TableStatus = 'DISPONIBLE' | 'JUGANDO' | 'PREMIO_PENDIENTE' | 'COMPLETADO';

export function StatusBadge({ status }: { status: TableStatus | string }) {
  let styles = "";
  let label = status;

  switch (status) {
    case 'DISPONIBLE':
      styles = "bg-[#252429] text-[#958da1]";
      break;
    case 'JUGANDO':
      styles = "bg-[#0d2239] text-[#60a5fa] animate-pulse";
      break;
    case 'PREMIO_PENDIENTE':
      styles = "bg-[#2a1f00] text-[#f59e0b]";
      label = "PREMIO PEND.";
      break;
    case 'COMPLETADO':
      styles = "bg-[#0d2e1f] text-[#10b981]";
      break;
    default:
      styles = "bg-[#252429] text-[#958da1]";
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${styles}`}>
      {label}
    </span>
  );
}
