/**
 * A single error captured during flow execution.
 *
 * Errors can occur at the flow level (e.g. session setup failure)
 * or at a specific step (assertion mismatch, timeout).
 */
export interface EvidenceError {
  /** Error classification code (e.g. "TimeoutError", "AssertionError"). */
  code: string;
  /** Human-readable error message. */
  message: string;
  /** Zero-based index of the step that caused the error, or `null` for flow-level errors. */
  stepIndex: number | null;
  /** ISO-8601 timestamp of when the error occurred. */
  timestamp: string;
  /** Optional additional context (stack trace, DOM snapshot, etc.). */
  details?: string;
}
