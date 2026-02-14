/**
 * Base properties shared by all step types.
 */
interface BaseStep {
  /** Human-readable context for why this step matters. */
  description?: string;
  /** Optional condition expression that gates execution of this step. */
  condition?: string;
}

export interface NavigateStep extends BaseStep {
  action: "navigate";
  url: string;
}

export interface ClickStep extends BaseStep {
  action: "click";
  selector: string;
}

export interface FillStep extends BaseStep {
  action: "fill";
  selector: string;
  value: string;
}

export interface AssertStep extends BaseStep {
  action: "assert";
  selector: string;
  text: string;
}

export interface SelectStep extends BaseStep {
  action: "select";
  selector: string;
  value: string;
}

export interface HoverStep extends BaseStep {
  action: "hover";
  selector: string;
}

export interface WaitStep extends BaseStep {
  action: "wait";
  /** Duration in milliseconds. */
  duration: number;
}

/**
 * Discriminated union of all built-in step types.
 * The `action` field serves as the discriminant.
 */
export type Step =
  | NavigateStep
  | ClickStep
  | FillStep
  | AssertStep
  | SelectStep
  | HoverStep
  | WaitStep;

/** Union of all built-in action type identifiers. */
export type ActionType = Step["action"];
