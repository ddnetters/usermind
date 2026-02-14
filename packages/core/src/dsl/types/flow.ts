import type { Actor } from "./actor.js";
import type { Constraint, ConstraintInput } from "./constraint.js";
import type { Fragment } from "./fragment.js";
import type { Step } from "./step.js";

/**
 * A parsed, normalized flow definition.
 *
 * All constraints have been expanded from shorthand strings into
 * full Constraint objects. This is the shape the guidance engine works with.
 */
export interface Flow {
  /** Unique identifier for this flow. */
  name: string;
  /** Human-readable summary of what this flow does. */
  description?: string;
  /** The role-aware identity the agent assumes. */
  actor: Actor;
  /** Guardrails that restrict agent behavior (normalized to objects). */
  constraints: Constraint[];
  /** Ordered sequence of actions the agent should perform. */
  steps: Step[];
  /** Reusable step groups that can be composed into this flow. */
  fragments?: Fragment[];
}

/**
 * Raw flow shape as it appears in YAML before parsing.
 *
 * Constraints may be bare strings or full objects. The parser
 * normalizes RawFlow into Flow.
 */
export interface RawFlow {
  name: string;
  description?: string;
  actor: Actor;
  /** Constraints as written in YAML — strings or objects. */
  constraints: ConstraintInput[];
  steps: Step[];
  fragments?: Fragment[];
}
