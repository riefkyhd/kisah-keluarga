"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

type FormSubmitButtonProps = ButtonProps & {
  pendingLabel: string;
};

export function FormSubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = Boolean(disabled) || pending;

  return (
    <Button disabled={isDisabled} {...props}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}
