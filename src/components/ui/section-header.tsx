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
    <header className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-sm font-medium uppercase tracking-wide text-amber-700">{eyebrow}</p>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? <p className="max-w-2xl text-base leading-relaxed text-stone-600">{description}</p> : null}
    </header>
  );
}

