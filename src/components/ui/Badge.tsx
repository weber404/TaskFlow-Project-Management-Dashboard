import React from "react";
import { ProjectStatus, TaskStatus } from "@/lib/db";

export type BadgeVariant =
  | "ACTIVE"
  | "COMPLETED"
  | "ON_HOLD"
  | "PENDING"
  | "IN_PROGRESS"
  | "OVERDUE"
  | "NEUTRAL";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant | ProjectStatus | TaskStatus | string;
  size?: "sm" | "md";
  showDot?: boolean;
}

const badgeStyles: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  ACTIVE: {
    bg: "bg-[#72C7BE]/12",
    text: "text-[#72C7BE]",
    border: "border-[#72C7BE]/25",
    dot: "bg-[#72C7BE]",
    label: "Active",
  },
  COMPLETED: {
    bg: "bg-[#72C7A5]/12",
    text: "text-[#72C7A5]",
    border: "border-[#72C7A5]/25",
    dot: "bg-[#72C7A5]",
    label: "Completed",
  },
  ON_HOLD: {
    bg: "bg-[#E5BE72]/12",
    text: "text-[#E5BE72]",
    border: "border-[#E5BE72]/25",
    dot: "bg-[#E5BE72]",
    label: "On Hold",
  },
  PENDING: {
    bg: "bg-surface-elevated",
    text: "text-text-secondary",
    border: "border-border",
    dot: "bg-text-muted",
    label: "Pending",
  },
  IN_PROGRESS: {
    bg: "bg-[#82B8E8]/12",
    text: "text-[#82B8E8]",
    border: "border-[#82B8E8]/25",
    dot: "bg-[#82B8E8]",
    label: "In Progress",
  },
  OVERDUE: {
    bg: "bg-[#EF7777]/12",
    text: "text-[#EF7777]",
    border: "border-[#EF7777]/25",
    dot: "bg-[#EF7777]",
    label: "Overdue",
  },
  NEUTRAL: {
    bg: "bg-surface-elevated",
    text: "text-text-secondary",
    border: "border-border",
    dot: "bg-text-muted",
    label: "Neutral",
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "NEUTRAL",
  size = "md",
  showDot = true,
  className = "",
  children,
  ...props
}) => {
  const normalizedKey = typeof variant === "string" ? variant.toUpperCase() : "NEUTRAL";
  const style = badgeStyles[normalizedKey] || badgeStyles.NEUTRAL;

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`size-1.5 rounded-full shrink-0 ${style.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children || style.label}</span>
    </span>
  );
};
