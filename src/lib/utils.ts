/**
 * Helper to combine conditional CSS class names cleanly.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a calendar date safely using UTC to avoid timezone shift.
 * Example output: "Aug 15, 2026"
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "No deadline";

  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "Invalid date";

    // Format consistently using UTC
    return d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

/**
 * Checks whether a project deadline is overdue.
 * A project is considered overdue if its deadline has passed and its status is not COMPLETED.
 */
export function isOverdue(
  deadlineInput: string | Date | null | undefined,
  status?: string
): boolean {
  if (!deadlineInput) return false;
  if (status === "COMPLETED") return false;

  try {
    const deadline = typeof deadlineInput === "string" ? new Date(deadlineInput) : deadlineInput;
    if (isNaN(deadline.getTime())) return false;

    return deadline.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Formats a date string or object to YYYY-MM-DD for standard HTML date inputs.
 */
export function formatDateForInput(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}
