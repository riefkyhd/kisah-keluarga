import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusBannerVariant = "success" | "error" | "warning" | "info";

type StatusBannerProps = {
  variant: StatusBannerVariant;
  message: string;
  className?: string;
};

const variantStyles: Record<StatusBannerVariant, string> = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-800",
  error: "border-rose-300 bg-rose-50 text-rose-800",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  info: "border-sky-300 bg-sky-50 text-sky-800"
};

const variantIcons: Record<StatusBannerVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info
};

export function StatusBanner({ variant, message, className }: StatusBannerProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed",
        variantStyles[variant],
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}
