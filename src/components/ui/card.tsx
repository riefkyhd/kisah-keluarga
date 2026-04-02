import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  clickable?: boolean;
};

export function Card({ className, clickable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--kk-radius-lg)] border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-5 shadow-[var(--kk-shadow-card)] sm:p-6",
        clickable && "kk-interactive cursor-pointer hover:-translate-y-0.5 hover:bg-[color:var(--color-warm)]/35 hover:shadow-[var(--kk-shadow-panel)]",
        className
      )}
      {...props}
    />
  );
}
