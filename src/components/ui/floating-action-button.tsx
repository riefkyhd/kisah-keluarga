import Link from "next/link";
import { cn } from "@/lib/utils";

type FloatingActionButtonProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
};

export function FloatingActionButton({
  href,
  label,
  icon: Icon,
  className
}: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "kk-interactive fixed bottom-24 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--color-clay)] text-[color:var(--color-cream)] shadow-[var(--kk-shadow-float)] hover:-translate-y-0.5 hover:bg-[color:var(--color-bark)] active:scale-[0.98] md:bottom-8",
        className
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
}
