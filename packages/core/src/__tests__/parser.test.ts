import { describe, it, expect } from "vitest";
import { parseFlow, ParseError, ACTION_TYPES, REQUIRED_FIELDS } from "../index.js";
import type { Flow } from "../index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid flow YAML for composing test inputs. */
const MINIMAL_YAML = `
name: minimal
actor:
  role: visitor
constraints:
  - stay on site
steps:
  - action: navigate
    url: https://example.com
`;

/** hello.yaml golden path — the canonical example from the DSL spec. */
const HELLO_YAML = `
name: hello
description: A minimal example flow that navigates to a page and checks the title.
actor:
  role: visitor
constraints:
  - do not navigate away from example.com
steps:
  - action: navigate
    url: https://example.com
  - action: assert
    selector: h1
    text: Example Domain
`;

// ---------------------------------------------------------------------------
// Valid flows
// ---------------------------------------------------------------------------

describe("parseFlow – valid flows", () => {
  it("parses the hello.yaml golden path", () => {
    const flow = parseFlow(HELLO_YAML);

    expect(flow.name).toBe("hello");
    expect(flow.description).toBe(
      "A minimal example flow that navigates to a page and checks the title.",
    );
    expect(flow.actor).toEqual({ role: "visitor" });
    expect(flow.constraints).toEqual([
      { rule: "do not navigate away from example.com" },
    ]);
    expect(flow.steps).toHaveLength(2);
    expect(flow.steps[0]).toEqual({ action: "navigate", url: "https://example.com" });
    expect(flow.steps[1]).toEqual({ action: "assert", selector: "h1", text: "Example Domain" });
  });

  it("parses a minimal flow", () => {
    const flow = parseFlow(MINIMAL_YAML);
    expect(flow.name).toBe("minimal");
    expect(flow.description).toBeUndefined();
    expect(flow.fragments).toBeUndefined();
  });

  it("handles all 7 action types", () => {
    const yaml = `
name: all-actions
actor:
  role: tester
constraints: []
steps:
  - action: navigate
    url: https://example.com
  - action: click
    selector: "#btn"
  - action: fill
    selector: "#input"
    value: hello
  - action: assert
    selector: h1
    text: Title
  - action: select
    selector: "#dropdown"
    value: opt1
  - action: hover
    selector: ".menu"
  - action: wait
    duration: 500
`;
    const flow = parseFlow(yaml);
    expect(flow.steps).toHaveLength(7);
    const actions = flow.steps.map((s) => s.action);
    expect(actions).toEqual([
      "navigate", "click", "fill", "assert", "select", "hover", "wait",
    ]);
  });

  it("normalises string constraints to objects", () => {
    const flow = parseFlow(HELLO_YAML);
    expect(flow.constraints).toEqual([
      { rule: "do not navigate away from example.com" },
    ]);
  });

  it("handles mixed string and object constraints", () => {
    const yaml = `
name: mixed-constraints
actor:
  role: user
constraints:
  - stay on site
  - rule: do not delete data
    scope: flow
  - rule: wait before clicking
    scope: step
steps:
  - action: navigate
    url: https://example.com
`;
    const flow = parseFlow(yaml);
    expect(flow.constraints).toEqual([
      { rule: "stay on site" },
      { rule: "do not delete data", scope: "flow" },
      { rule: "wait before clicking", scope: "step" },
    ]);
  });

  it("accepts empty constraints array", () => {
    const yaml = `
name: no-constraints
actor:
  role: admin
constraints: []
steps:
  - action: navigate
    url: https://example.com
`;
    const flow = parseFlow(yaml);
    expect(flow.constraints).toEqual([]);
  });

  it("accepts actor with permissions and session", () => {
    const yaml = `
name: full-actor
actor:
  role: admin
  permissions:
    - read
    - write
  session:
    token: abc123
    user_id: "42"
constraints: []
steps:
  - action: navigate
    url: https://example.com
`;
    const flow = parseFlow(yaml);
    expect(flow.actor).toEqual({
      role: "admin",
      permissions: ["read", "write"],
      session: { token: "abc123", user_id: "42" },
    });
  });

  it("parses flows with fragments", () => {
    const yaml = `
name: with-fragments
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
fragments:
  - name: login
    steps:
      - action: fill
        selector: "#email"
        value: user@example.com
      - action: fill
        selector: "#password"
        value: secret
      - action: click
        selector: "#submit"
`;
    const flow = parseFlow(yaml);
    expect(flow.fragments).toHaveLength(1);
    expect(flow.fragments![0].name).toBe("login");
    expect(flow.fragments![0].steps).toHaveLength(3);
  });

  it("accepts optional step fields (description, condition)", () => {
    const yaml = `
name: optional-fields
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
    description: Go to homepage
    condition: not_logged_in
`;
    const flow = parseFlow(yaml);
    const step = flow.steps[0] as { description?: string; condition?: string };
    expect(step.description).toBe("Go to homepage");
    expect(step.condition).toBe("not_logged_in");
  });

  it("passes through extra YAML fields for forward compatibility", () => {
    const yaml = `
name: future-compat
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
metadata:
  version: 2
`;
    const flow = parseFlow(yaml);
    expect(flow.name).toBe("future-compat");
    // Extra field should survive the pipeline
    expect((flow as unknown as Record<string, unknown>)["metadata"]).toEqual({ version: 2 });
  });

  it("accepts fragment with condition", () => {
    const yaml = `
name: conditional-fragment
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
fragments:
  - name: optional-step
    condition: feature_enabled
    steps:
      - action: click
        selector: "#feature"
`;
    const flow = parseFlow(yaml);
    expect(flow.fragments![0].condition).toBe("feature_enabled");
  });
});

// ---------------------------------------------------------------------------
// YAML syntax errors
// ---------------------------------------------------------------------------

describe("parseFlow – YAML errors", () => {
  it("throws ParseError on malformed YAML", () => {
    const bad = `
name: broken
  invalid: indentation
actor:
`;
    expect(() => parseFlow(bad)).toThrow(ParseError);
  });

  it("preserves the original YAML error as cause", () => {
    try {
      parseFlow(":\n  :\n  - :\n  invalid: [");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
      expect((err as ParseError).message).toBe("Invalid YAML syntax");
      expect((err as ParseError).cause).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Structural errors
// ---------------------------------------------------------------------------

describe("parseFlow – structural errors", () => {
  it("rejects non-object (string)", () => {
    expect(() => parseFlow('"just a string"')).toThrow(ParseError);
    expect(() => parseFlow('"just a string"')).toThrow("must be an object");
  });

  it("rejects non-object (array)", () => {
    expect(() => parseFlow("- item1\n- item2")).toThrow(ParseError);
  });

  it("rejects non-object (null)", () => {
    expect(() => parseFlow("null")).toThrow(ParseError);
  });

  it("rejects missing name", () => {
    const yaml = `
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'name'");
  });

  it("rejects empty name", () => {
    const yaml = `
name: ""
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'name'");
  });

  it("rejects missing actor", () => {
    const yaml = `
name: test
constraints: []
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'actor'");
  });

  it("rejects actor without role", () => {
    const yaml = `
name: test
actor:
  permissions: []
constraints: []
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'actor.role'");
  });

  it("rejects non-array constraints", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: "not an array"
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'constraints'");
  });

  it("rejects missing steps", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'steps'");
  });

  it("rejects empty steps array", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps: []
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'steps'");
  });
});

// ---------------------------------------------------------------------------
// Step errors
// ---------------------------------------------------------------------------

describe("parseFlow – step errors", () => {
  it("rejects unknown action type", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: fly
    destination: moon
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("unknown action 'fly'");
  });

  it("rejects step missing required field (navigate without url)", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: navigate
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'url'");
  });

  it("rejects step missing required field (fill without value)", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: fill
    selector: "#input"
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'value'");
  });

  it("rejects step missing required field (assert without text)", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: assert
    selector: h1
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'text'");
  });

  it("rejects wait step with non-positive duration", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: wait
    duration: -100
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("duration");
  });

  it("rejects wait step with zero duration", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: wait
    duration: 0
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("duration");
  });

  it("rejects wait step with string duration", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: wait
    duration: "fast"
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("duration");
  });

  it("rejects non-object step", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - just a string
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("Step at index 0 must be an object");
  });

  it("includes step index in error message", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
  - action: click
`;
    try {
      parseFlow(yaml);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ParseError);
      expect((err as ParseError).message).toContain("Step 1");
      expect((err as ParseError).path).toBe("steps[1].selector");
    }
  });
});

// ---------------------------------------------------------------------------
// Constraint errors
// ---------------------------------------------------------------------------

describe("parseFlow – constraint errors", () => {
  it("rejects constraint that is neither string nor object", () => {
    const yaml = `
name: test
actor:
  role: user
constraints:
  - 42
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("Constraint at index 0");
  });

  it("rejects object constraint without rule", () => {
    const yaml = `
name: test
actor:
  role: user
constraints:
  - scope: flow
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'rule'");
  });

  it("rejects constraint with invalid scope", () => {
    const yaml = `
name: test
actor:
  role: user
constraints:
  - rule: stay on site
    scope: global
steps:
  - action: navigate
    url: https://example.com
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("invalid scope 'global'");
  });
});

// ---------------------------------------------------------------------------
// Fragment errors
// ---------------------------------------------------------------------------

describe("parseFlow – fragment errors", () => {
  it("rejects fragment missing name", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
fragments:
  - steps:
      - action: click
        selector: "#btn"
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'name'");
  });

  it("rejects fragment with empty steps", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
fragments:
  - name: empty
    steps: []
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("non-empty 'steps'");
  });

  it("rejects fragment with invalid step inside", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
fragments:
  - name: broken
    steps:
      - action: unknown_action
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("unknown action");
  });

  it("rejects non-array fragments", () => {
    const yaml = `
name: test
actor:
  role: user
constraints: []
steps:
  - action: navigate
    url: https://example.com
fragments: "not an array"
`;
    expect(() => parseFlow(yaml)).toThrow(ParseError);
    expect(() => parseFlow(yaml)).toThrow("'fragments'");
  });
});

// ---------------------------------------------------------------------------
// ParseError class
// ---------------------------------------------------------------------------

describe("ParseError", () => {
  it("is an instance of Error", () => {
    const err = new ParseError("test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ParseError);
  });

  it("has the correct name", () => {
    const err = new ParseError("test");
    expect(err.name).toBe("ParseError");
  });

  it("carries a path", () => {
    const err = new ParseError("bad field", { path: "steps[0].selector" });
    expect(err.path).toBe("steps[0].selector");
  });

  it("carries a cause", () => {
    const original = new Error("original");
    const err = new ParseError("wrapped", { cause: original });
    expect(err.cause).toBe(original);
  });

  it("defaults path to undefined", () => {
    const err = new ParseError("test");
    expect(err.path).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Registry exports
// ---------------------------------------------------------------------------

describe("ACTION_TYPES and REQUIRED_FIELDS", () => {
  it("contains all 7 action types", () => {
    expect(ACTION_TYPES.size).toBe(7);
    for (const action of ["navigate", "click", "fill", "assert", "select", "hover", "wait"]) {
      expect(ACTION_TYPES.has(action as never)).toBe(true);
    }
  });

  it("has required fields for every action type", () => {
    for (const action of ACTION_TYPES) {
      expect(REQUIRED_FIELDS[action]).toBeDefined();
      expect(Array.isArray(REQUIRED_FIELDS[action])).toBe(true);
    }
  });

  it("navigate requires url", () => {
    expect(REQUIRED_FIELDS.navigate).toEqual(["url"]);
  });

  it("fill requires selector and value", () => {
    expect(REQUIRED_FIELDS.fill).toEqual(["selector", "value"]);
  });

  it("wait requires duration", () => {
    expect(REQUIRED_FIELDS.wait).toEqual(["duration"]);
  });
});

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

describe("parseFlow – return type", () => {
  it("returns a Flow object", () => {
    const flow: Flow = parseFlow(HELLO_YAML);
    expect(flow).toBeDefined();
    expect(typeof flow.name).toBe("string");
    expect(Array.isArray(flow.constraints)).toBe(true);
    expect(Array.isArray(flow.steps)).toBe(true);
  });
});
