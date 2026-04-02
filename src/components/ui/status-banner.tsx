import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusBannerVariant = "success" | "error" | "warning" | "info";

type StatusBannerProps = {
  variant: StatusBannerVariant;
  message: string;
  className?: string;
};

const variantStyles: Record<StatusBannerVariant, string> = {
  success: "border-[color:#c8ddd0] bg-[color:#f0f5f1] text-[color:#3f5c45]",
  error: "border-[color:#f3c7c1] bg-[color:#fdf2f0] text-[color:#9b3022]",
  warning: "border-[color:var(--color-sand)] bg-[color:var(--color-warm)] text-[color:var(--color-bark)]",
  info: "border-[color:#d8c7b3] bg-[color:#f7f3ed] text-[color:var(--color-clay)]"
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
        "kk-interactive flex items-center gap-3 rounded-[var(--kk-radius-md)] border-2 px-4 py-4 text-base font-bold leading-relaxed",
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-6 w-6 shrink-0" />
      <p className="flex-1 leading-tight">{message}</p>
    </div>
  );
}
