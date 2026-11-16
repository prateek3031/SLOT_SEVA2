import { Badge } from "@/components/ui/badge";
import type { ApptStatus } from "@/lib/types";

const STYLES: Record<ApptStatus, string> = {
  CONFIRMED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  PENDING_PAYMENT: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  COMPLETED: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  CANCELLED: "border-red-500/40 bg-red-500/10 text-red-400",
};

export default function StatusBadge({ status }: { status: ApptStatus }) {
  return (
    <Badge
      variant="outline"
      className={`font-mono text-[10px] tracking-[0.15em] ${STYLES[status]}`}
      data-testid={`appointment-status-${status.toLowerCase()}`}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
