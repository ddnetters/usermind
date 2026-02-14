import type { Actor } from "../../dsl/types/actor.js";
import type { EvidenceStepResult } from "./step-result.js";
import type { EvidenceError } from "./error-entry.js";

/** Overall outcome of a flow execution. */
export type BundleStatus = "passed" | "failed" | "error" | "running";

/**
 * Complete execution trace for a single flow run.
 *
 * Captures the identity (flow + actor), timing, step-by-step results,
 * and any errors that occurred. This is the top-level evidence artifact
 * produced by the runner and consumed by reporters / dashboards.
 */
export interface EvidenceBundle {
  /** Name of the flow that was executed. */
  flowName: string;
  /** Unique identifier for this execution session. */
  sessionId: string;
  /** The actor (role + permissions + session data) that ran the flow. */
  actor: Actor;
  /** ISO-8601 timestamp of when execution started. */
  startedAt: string;
  /** ISO-8601 timestamp of when execution finished, or `null` while still running. */
  finishedAt: string | null;
  /** Aggregate status of the execution. */
  status: BundleStatus;
  /** Ordered list of step-level evidence, one entry per executed step. */
  steps: EvidenceStepResult[];
  /** Errors encountered during execution (step-level and flow-level). */
  errors: EvidenceError[];
}
