import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
  secondary: "bg-muted text-foreground hover:bg-muted/70",
  outline:
    "border border-border bg-transparent hover:bg-muted/60 text-foreground",
  ghost: "bg-transparent hover:bg-muted/60 text-foreground",
  destructive: "bg-lost text-white hover:bg-lost/90 shadow-sm shadow-lost/20",
  success: "bg-won text-white hover:bg-won/90 shadow-sm shadow-won/20",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
