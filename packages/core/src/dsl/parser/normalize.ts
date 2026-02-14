import type { Constraint, ConstraintInput } from "../types/constraint.js";
import type { Flow } from "../types/flow.js";
import type { RawFlow } from "../types/flow.js";

function normalizeConstraint(input: ConstraintInput): Constraint {
  if (typeof input === "string") {
    return { rule: input };
  }
  return input;
}

/**
 * Converts a validated {@link RawFlow} into a fully normalised {@link Flow}.
 *
 * Currently the only transformation is expanding bare-string constraints
 * into `{ rule: string }` objects.
 */
export function normalizeFlow(raw: RawFlow): Flow {
  return {
    ...raw,
    constraints: raw.constraints.map(normalizeConstraint),
  };
}
