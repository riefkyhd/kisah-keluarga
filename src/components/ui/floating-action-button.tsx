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
        "fixed bottom-24 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-700 text-white shadow-[0_10px_26px_rgb(180,83,9,0.35)] transition-all hover:-translate-y-0.5 hover:bg-amber-800 active:scale-95 md:bottom-8",
        className
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
}
