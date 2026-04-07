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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="text-[12px] font-bold uppercase tracking-widest text-[color:var(--color-clay)]">{eyebrow}</p>
          ) : null}
          <h2 className="text-4xl font-bold tracking-tight text-[color:var(--color-bark)] sm:text-5xl">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p className="max-w-3xl text-lg font-medium leading-relaxed text-[color:var(--kk-muted)] pt-2">
          {description}
        </p>
      ) : null}
    </header>
  );
}
