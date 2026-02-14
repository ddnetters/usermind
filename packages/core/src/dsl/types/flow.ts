import type { Actor } from "./actor.js";
import type { Constraint } from "./constraint.js";
import type { Fragment } from "./fragment.js";
import type { Step } from "./step.js";

/**
 * A complete user journey definition.
 *
 * Flows describe the sequence of actions an agent should perform,
 * the role it assumes, and the constraints it must respect.
 */
export interface Flow {
  /** Unique identifier for this flow. */
  name: string;
  /** Human-readable summary of what this flow does. */
  description?: string;
  /** The role-aware identity the agent assumes. */
  actor: Actor;
  /** Guardrails that restrict agent behavior. */
  constraints: Constraint[];
  /** Ordered sequence of actions the agent should perform. */
  steps: Step[];
  /** Reusable step groups that can be composed into this flow. */
  fragments?: Fragment[];
}
