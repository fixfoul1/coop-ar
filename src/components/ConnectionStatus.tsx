import type { ConnectionStatus as Status } from "../hooks/usePeerConnection";
import { cn } from "../utils/cn";

interface ConnectionStatusProps {
  status: Status;
}

const STATUS_MAP: Record<Status, { label: string; color: string; dot: string }> = {
  disconnected: { label: "غير متصل", color: "text-slate-400", dot: "bg-slate-400" },
  connecting: { label: "جارٍ الاتصال...", color: "text-amber-400", dot: "bg-amber-400" },
  connected: { label: "متصل", color: "text-emerald-400", dot: "bg-emerald-400" },
  error: { label: "خطأ في الاتصال", color: "text-red-400", dot: "bg-red-400" },
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const { label, color, dot } = STATUS_MAP[status];
  return (
    <div className={cn("flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs", color)}>
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          dot,
          status === "connecting" && "animate-pulse"
        )}
      />
      {label}
    </div>
  );
}
