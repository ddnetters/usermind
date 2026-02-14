/**
 * A guardrail that restricts agent behavior during flow execution.
 */
export interface Constraint {
  /** Human-readable rule text (e.g. "do not navigate away from example.com"). */
  rule: string;
}
