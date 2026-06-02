import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:transition-transform group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover shadow-[0_4px_24px_-6px_rgba(255,89,94,0.45)] hover:shadow-[0_6px_28px_-4px_rgba(255,89,94,0.55)]",
        secondary:
          "bg-white text-foreground border border-border hover:border-neutral-300 hover:bg-neutral-50",
        ghost: "text-foreground hover:bg-neutral-100",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full",
        default: "h-11 px-6 text-[15px] rounded-full",
        lg: "h-13 px-8 text-base rounded-full py-3.5",
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
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
