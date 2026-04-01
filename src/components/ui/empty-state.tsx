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
        "rounded-[2rem] border border-dashed border-stone-300 bg-white p-6 text-center text-stone-700",
        className
      )}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
        <Info className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
