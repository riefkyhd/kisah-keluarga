import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, className, action }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--kk-radius-lg)] border border-dashed border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] p-6 text-center text-[color:var(--color-bark)]",
        className
      )}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[var(--kk-radius-md)] bg-[color:var(--color-warm)] text-[color:var(--color-clay)]">
        <Info className="h-5 w-5" />
      </div>
      <h3 className="text-base text-[color:var(--color-bark)]">{title}</h3>
      <p className="mt-1.5 text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
