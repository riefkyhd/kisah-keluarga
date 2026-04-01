import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  clickable?: boolean;
};

export function Card({ className, clickable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-stone-100 bg-white p-6 shadow-sm",
        clickable && "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}
