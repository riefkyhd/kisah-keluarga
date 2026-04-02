import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
  eyebrow?: string;
};

export function SectionHeader({
  title,
  description,
  className,
  action,
  eyebrow
}: SectionHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2.5">
          {eyebrow ? (
            <p className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-clay)]">{eyebrow}</p>
          ) : null}
          <h2 className="text-3xl tracking-tight text-[color:var(--color-bark)] sm:text-[2rem]">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="max-w-2xl text-[15px] font-normal leading-relaxed text-[color:var(--kk-muted)]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
