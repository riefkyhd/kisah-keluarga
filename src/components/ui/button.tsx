import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "kk-interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--kk-radius-md)] border border-transparent px-5 py-3 text-base font-medium text-[color:var(--color-bark)] active:scale-[0.98] focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-inherit",
  {
    variants: {
      variant: {
        primary:
          "bg-[color:var(--color-clay)] text-[color:var(--color-cream)] shadow-[var(--kk-shadow-soft)] hover:bg-[color:var(--color-bark)]",
        secondary:
          "border-[color:rgba(212,184,150,0.4)] bg-[color:var(--color-warm)] text-[color:var(--color-bark)] hover:bg-[color:#e7dfd3]",
        outline:
          "border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] text-[color:var(--color-clay)] hover:bg-[color:var(--color-warm)]",
        ghost: "bg-transparent text-[color:var(--color-clay)] hover:bg-[color:var(--color-warm)]",
        danger:
          "border-[color:#f3c7c1] bg-[color:#fdf2f0] text-[color:#9b3022] hover:bg-[color:#fae7e3]"
      },
      size: {
        default: "",
        sm: "min-h-10 rounded-[var(--kk-radius-sm)] px-4 py-2 text-sm",
        icon: "h-10 min-h-10 w-10 rounded-[var(--kk-radius-md)] p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
