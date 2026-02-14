/** Scope at which a constraint applies. */
export type ConstraintScope = "flow" | "step";

/**
 * A guardrail that restricts agent behavior during flow execution.
 */
export interface Constraint {
  /** Human-readable rule text (e.g. "do not navigate away from example.com"). */
  rule: string;
  /** Whether this constraint applies to the entire flow or a single step. Defaults to "flow". */
  scope?: ConstraintScope;
}

/**
 * In YAML, constraints can be written as bare strings (shorthand)
 * or as full objects. The parser normalizes strings into Constraint objects.
 */
export type ConstraintInput = string | Constraint;
