import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  clickable?: boolean;
};

export function Card({ className, clickable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--kk-radius-lg)] border-[1.5px] border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] p-6 shadow-[var(--kk-shadow-card)] sm:p-7 relative overflow-hidden",
        clickable && "kk-interactive cursor-pointer hover:border-[color:var(--color-sand)] hover:shadow-[var(--kk-shadow-float)] group",
        className
      )}
      {...props}
    />
  );
}
