import type { ActionType } from "../types/step.js";

/** All recognised action type identifiers. */
export const ACTION_TYPES: ReadonlySet<ActionType> = new Set<ActionType>([
  "navigate",
  "click",
  "fill",
  "assert",
  "select",
  "hover",
  "wait",
]);

/**
 * Per-action map of fields that MUST be present on a step.
 *
 * `action` itself is implicitly required and is not listed here.
 * Optional base-step fields (`description`, `condition`) are never required.
 */
export const REQUIRED_FIELDS: Readonly<Record<ActionType, readonly string[]>> = {
  navigate: ["url"],
  click: ["selector"],
  fill: ["selector", "value"],
  assert: ["selector", "text"],
  select: ["selector", "value"],
  hover: ["selector"],
  wait: ["duration"],
};
