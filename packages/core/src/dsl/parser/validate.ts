import type { ActionType } from "../types/step.js";
import type { RawFlow } from "../types/flow.js";
import { ACTION_TYPES, REQUIRED_FIELDS } from "./action-registry.js";
import { ParseError } from "./errors.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(message: string, path?: string, cause?: unknown): never {
  throw new ParseError(message, { path, cause });
}

// ---------------------------------------------------------------------------
// Section validators
// ---------------------------------------------------------------------------

function validateActor(actor: unknown): void {
  if (!isRecord(actor)) {
    fail("'actor' must be an object", "actor");
  }
  if (typeof actor["role"] !== "string" || actor["role"] === "") {
    fail("'actor.role' must be a non-empty string", "actor.role");
  }
  if (actor["permissions"] !== undefined) {
    if (
      !Array.isArray(actor["permissions"]) ||
      !actor["permissions"].every((p: unknown) => typeof p === "string")
    ) {
      fail("'actor.permissions' must be an array of strings", "actor.permissions");
    }
  }
  if (actor["session"] !== undefined) {
    if (!isRecord(actor["session"])) {
      fail("'actor.session' must be an object of string key-value pairs", "actor.session");
    }
    for (const [key, val] of Object.entries(actor["session"])) {
      if (typeof val !== "string") {
        fail(
          `'actor.session.${key}' must be a string`,
          `actor.session.${key}`,
        );
      }
    }
  }
}

function validateConstraint(c: unknown, index: number): void {
  if (typeof c === "string") return;
  if (!isRecord(c)) {
    fail(
      `Constraint at index ${index} must be a string or an object with a 'rule' field`,
      `constraints[${index}]`,
    );
  }
  if (typeof c["rule"] !== "string" || c["rule"] === "") {
    fail(
      `Constraint at index ${index} is missing a non-empty 'rule' field`,
      `constraints[${index}].rule`,
    );
  }
  if (c["scope"] !== undefined && c["scope"] !== "flow" && c["scope"] !== "step") {
    fail(
      `Constraint at index ${index} has invalid scope '${String(c["scope"])}'; expected 'flow' or 'step'`,
      `constraints[${index}].scope`,
    );
  }
}

function validateStep(step: unknown, index: number): void {
  if (!isRecord(step)) {
    fail(`Step at index ${index} must be an object`, `steps[${index}]`);
  }

  const action = step["action"];
  if (typeof action !== "string" || !ACTION_TYPES.has(action as ActionType)) {
    fail(
      `Step at index ${index} has unknown action '${String(action)}'; expected one of: ${[...ACTION_TYPES].join(", ")}`,
      `steps[${index}].action`,
    );
  }

  const required = REQUIRED_FIELDS[action as ActionType];
  for (const field of required) {
    const value = step[field];
    if (value === undefined || value === null) {
      fail(
        `Step ${index} (action: '${action}') is missing required field '${field}'`,
        `steps[${index}].${field}`,
      );
    }
    if (field === "duration") {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        fail(
          `Step ${index} (action: '${action}') field 'duration' must be a positive number`,
          `steps[${index}].duration`,
        );
      }
    }
  }
}

function validateFragment(frag: unknown, index: number): void {
  if (!isRecord(frag)) {
    fail(`Fragment at index ${index} must be an object`, `fragments[${index}]`);
  }
  if (typeof frag["name"] !== "string" || frag["name"] === "") {
    fail(
      `Fragment at index ${index} is missing a non-empty 'name' field`,
      `fragments[${index}].name`,
    );
  }
  if (!Array.isArray(frag["steps"]) || frag["steps"].length === 0) {
    fail(
      `Fragment '${String(frag["name"] ?? index)}' must have a non-empty 'steps' array`,
      `fragments[${index}].steps`,
    );
  }
  for (let i = 0; i < frag["steps"].length; i++) {
    validateStep(frag["steps"][i], i);
  }
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/**
 * Validates an unknown parsed-YAML value and returns it typed as {@link RawFlow}.
 *
 * Throws {@link ParseError} on the first validation failure.
 */
export function validateRawFlow(data: unknown): RawFlow {
  // -- Top-level shape --
  if (!isRecord(data)) {
    fail("Flow definition must be an object");
  }

  // -- name --
  if (typeof data["name"] !== "string" || data["name"] === "") {
    fail("'name' must be a non-empty string", "name");
  }

  // -- description (optional) --
  if (data["description"] !== undefined && typeof data["description"] !== "string") {
    fail("'description' must be a string", "description");
  }

  // -- actor --
  if (data["actor"] === undefined) {
    fail("'actor' is required", "actor");
  }
  validateActor(data["actor"]);

  // -- constraints --
  if (!Array.isArray(data["constraints"])) {
    fail("'constraints' must be an array", "constraints");
  }
  for (let i = 0; i < data["constraints"].length; i++) {
    validateConstraint(data["constraints"][i], i);
  }

  // -- steps --
  if (!Array.isArray(data["steps"]) || data["steps"].length === 0) {
    fail("'steps' must be a non-empty array", "steps");
  }
  for (let i = 0; i < data["steps"].length; i++) {
    validateStep(data["steps"][i], i);
  }

  // -- fragments (optional) --
  if (data["fragments"] !== undefined) {
    if (!Array.isArray(data["fragments"])) {
      fail("'fragments' must be an array", "fragments");
    }
    for (let i = 0; i < data["fragments"].length; i++) {
      validateFragment(data["fragments"][i], i);
    }
  }

  return data as unknown as RawFlow;
}
