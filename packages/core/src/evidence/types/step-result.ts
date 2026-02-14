import type { ActionType } from "../../dsl/types/step.js";

/** Outcome of an individual step execution. */
export type StepResultStatus = "passed" | "failed" | "error" | "skipped";

/**
 * Evidence record for a single step within a flow run.
 *
 * - `failed` = the step's assertion did not match (functional failure)
 * - `error`  = infrastructure problem (timeout, crash, network issue)
 */
export interface EvidenceStepResult {
  /** Zero-based position of this step in the flow's `steps` array. */
  stepIndex: number;
  /** The action type that was executed. */
  action: ActionType;
  /** Target of the action: URL for navigate, selector for click/fill, duration-as-string for wait. */
  target: string;
  /** Outcome of the step execution. */
  result: StepResultStatus;
  /** ISO-8601 timestamp of when the step completed. */
  timestamp: string;
  /** Screenshot path, data URI, or `null` if not captured. */
  screenshot: string | null;
  /** Wall-clock duration in milliseconds (omitted if not measured). */
  durationMs?: number;
}
