import React from "react";
import { Loader2 } from "lucide-react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "SM" | "MD" | "LG";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
  label = "Loading content...",
}) => {
  const normalizedSize = (size.toLowerCase() as "sm" | "md" | "lg") || "md";
  return (
    <div
      role="status"
      className="inline-flex items-center justify-center text-accent"
    >
      <Loader2
        className={`animate-spin ${sizeClasses[normalizedSize]} ${className}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};
