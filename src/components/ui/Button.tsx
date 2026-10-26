import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "destructive"
  | "ghost"
  | "PRIMARY"
  | "SECONDARY"
  | "OUTLINE"
  | "DANGER"
  | "GHOST";

export type ButtonSize = "sm" | "md" | "lg" | "SM" | "MD" | "LG";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-accent hover:bg-accent-hover text-[#111111] font-semibold shadow-xs focus-visible:ring-accent",
  PRIMARY:
    "bg-accent hover:bg-accent-hover text-[#111111] font-semibold shadow-xs focus-visible:ring-accent",
  secondary:
    "bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border focus-visible:ring-accent",
  SECONDARY:
    "bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border focus-visible:ring-accent",
  outline:
    "bg-transparent hover:bg-surface-elevated text-text-primary border border-border focus-visible:ring-accent",
  OUTLINE:
    "bg-transparent hover:bg-surface-elevated text-text-primary border border-border focus-visible:ring-accent",
  destructive:
    "bg-[#EF7777]/15 hover:bg-[#EF7777]/25 text-[#EF7777] border border-[#EF7777]/30 focus-visible:ring-[#EF7777]",
  DANGER:
    "bg-[#EF7777]/15 hover:bg-[#EF7777]/25 text-[#EF7777] border border-[#EF7777]/30 focus-visible:ring-[#EF7777]",
  ghost:
    "bg-transparent hover:bg-surface-elevated text-text-secondary hover:text-text-primary focus-visible:ring-accent",
  GHOST:
    "bg-transparent hover:bg-surface-elevated text-text-secondary hover:text-text-primary focus-visible:ring-accent",
};

const sizeStyles: Record<string, string> = {
  sm: "px-2.5 py-1.5 text-xs rounded-md gap-2",
  SM: "px-2.5 py-1.5 text-xs rounded-md gap-2",
  md: "px-3.5 py-2 text-sm rounded-lg gap-2",
  MD: "px-3.5 py-2 text-sm rounded-lg gap-2",
  lg: "px-5 py-2.5 text-base rounded-lg gap-2.5",
  LG: "px-5 py-2.5 text-base rounded-lg gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading: propLoading = false,
      isLoading: propIsLoading = false,
      disabled = false,
      type = "button",
      className = "",
      children,
      icon,
      ...props
    },
    ref
  ) => {
    const loading = propLoading || propIsLoading;
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`button-content inline-flex flex-row items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-ring [&>svg]:shrink-0 [&_svg]:shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
        ) : icon ? (
          <span className="shrink-0 inline-flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {typeof children === "string" || typeof children === "number" ? (
          <span className="whitespace-nowrap">{children}</span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
