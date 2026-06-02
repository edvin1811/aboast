import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-white hover:bg-primary-hover shadow-[0_4px_24px_-6px_rgba(255,89,94,0.45)] hover:shadow-[0_6px_28px_-4px_rgba(255,89,94,0.55)]",
        secondary:
          "rounded-full bg-white text-foreground border border-border hover:border-neutral-300 hover:bg-neutral-50",
        outline:
          "rounded-full bg-white text-foreground border border-border hover:border-neutral-300 hover:bg-neutral-50",
        ghost: "rounded-md text-foreground hover:bg-neutral-100",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_4px_24px_-6px_rgba(239,68,68,0.40)]",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-[15px]",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
