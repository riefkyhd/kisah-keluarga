import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-amber-700 text-white shadow-sm hover:bg-amber-800",
        secondary: "bg-stone-200 text-stone-800 hover:bg-stone-300",
        outline: "border-2 border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
        ghost: "bg-transparent text-stone-600 hover:bg-stone-100",
        danger: "bg-red-50 text-red-700 hover:bg-red-100"
      },
      size: {
        default: "",
        sm: "min-h-10 rounded-xl px-4 py-2.5 text-sm",
        icon: "h-10 min-h-10 w-10 rounded-xl p-0"
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
