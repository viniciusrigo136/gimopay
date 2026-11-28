import { cn } from "@/lib/cn";
import { STATUS_LABEL, STATUS_TONE } from "@/domain/status";
import type { AppointmentStatus } from "@/domain/types";

export function StatusChip({ status, className }: { status: AppointmentStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", STATUS_TONE[status].chip, className)}>
      <span className={cn("size-1.5 rounded-full", STATUS_TONE[status].dot)} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
