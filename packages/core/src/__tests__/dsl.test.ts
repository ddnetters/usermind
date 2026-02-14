import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  Flow,
  RawFlow,
  Actor,
  Constraint,
  ConstraintInput,
  ConstraintScope,
  Fragment,
  Step,
  ActionType,
  NavigateStep,
  ClickStep,
  FillStep,
  AssertStep,
  SelectStep,
  HoverStep,
  WaitStep,
} from "../index.js";

describe("DSL type definitions", () => {
  it("exports all types from the package root", () => {
    // If this file compiles, the barrel exports are wired correctly.
    expectTypeOf<Flow>().toBeObject();
    expectTypeOf<Actor>().toBeObject();
    expectTypeOf<Constraint>().toBeObject();
    expectTypeOf<Fragment>().toBeObject();
    expectTypeOf<Step>().toBeObject();
    expectTypeOf<ActionType>().toBeString();
  });

  it("narrows Step by action discriminant", () => {
    const step: Step = { action: "navigate", url: "https://example.com" };

    if (step.action === "navigate") {
      expectTypeOf(step).toEqualTypeOf<NavigateStep>();
      expect(step.url).toBe("https://example.com");
    }
  });

  it("covers all action types in the ActionType union", () => {
    const allActions: ActionType[] = [
      "navigate",
      "click",
      "fill",
      "assert",
      "select",
      "hover",
      "wait",
    ];
    expect(allActions).toHaveLength(7);
  });

  it("enforces required fields per step type", () => {
    const nav: NavigateStep = { action: "navigate", url: "https://example.com" };
    const click: ClickStep = { action: "click", selector: "#btn" };
    const fill: FillStep = { action: "fill", selector: "#input", value: "hello" };
    const assert: AssertStep = { action: "assert", selector: "h1", text: "Title" };
    const select: SelectStep = { action: "select", selector: "#dropdown", value: "opt1" };
    const hover: HoverStep = { action: "hover", selector: ".menu" };
    const wait: WaitStep = { action: "wait", duration: 1000 };

    const steps: Step[] = [nav, click, fill, assert, select, hover, wait];
    expect(steps).toHaveLength(7);
  });

  it("allows optional base properties on any step", () => {
    const step: NavigateStep = {
      action: "navigate",
      url: "https://example.com",
      description: "Go to the homepage",
      condition: "page_loaded",
    };
    expect(step.description).toBe("Go to the homepage");
    expect(step.condition).toBe("page_loaded");
  });

  it("represents a parsed flow (normalized from hello.yaml)", () => {
    const flow: Flow = {
      name: "hello",
      description: "A minimal example flow that navigates to a page and checks the title.",
      actor: { role: "visitor" },
      constraints: [{ rule: "do not navigate away from example.com" }],
      steps: [
        { action: "navigate", url: "https://example.com" },
        { action: "assert", selector: "h1", text: "Example Domain" },
      ],
    };

    expect(flow.name).toBe("hello");
    expect(flow.actor.role).toBe("visitor");
    expect(flow.constraints).toHaveLength(1);
    expect(flow.steps).toHaveLength(2);
  });

  it("represents raw YAML input with string constraints (hello.yaml)", () => {
    const raw: RawFlow = {
      name: "hello",
      description: "A minimal example flow that navigates to a page and checks the title.",
      actor: { role: "visitor" },
      constraints: ["do not navigate away from example.com"],
      steps: [
        { action: "navigate", url: "https://example.com" },
        { action: "assert", selector: "h1", text: "Example Domain" },
      ],
    };

    expect(raw.constraints[0]).toBe("do not navigate away from example.com");
  });

  it("supports constraint scope", () => {
    const flowConstraint: Constraint = {
      rule: "do not navigate away from example.com",
      scope: "flow",
    };
    const stepConstraint: Constraint = {
      rule: "do not clear the input before filling",
      scope: "step",
    };

    expect(flowConstraint.scope).toBe("flow");
    expect(stepConstraint.scope).toBe("step");
    expectTypeOf<ConstraintScope>().toEqualTypeOf<"flow" | "step">();
  });

  it("accepts mixed string and object constraints in RawFlow", () => {
    const raw: RawFlow = {
      name: "mixed",
      actor: { role: "user" },
      constraints: [
        "do not leave the app",
        { rule: "do not delete messages", scope: "flow" },
      ],
      steps: [{ action: "navigate", url: "https://example.com" }],
    };

    expect(raw.constraints).toHaveLength(2);
    expect(typeof raw.constraints[0]).toBe("string");
    expect(typeof raw.constraints[1]).toBe("object");
  });

  it("supports fragments on a flow", () => {
    const flow: Flow = {
      name: "with-fragments",
      actor: { role: "user" },
      constraints: [],
      steps: [{ action: "navigate", url: "https://example.com" }],
      fragments: [
        {
          name: "login",
          steps: [
            { action: "fill", selector: "#email", value: "user@example.com" },
            { action: "fill", selector: "#password", value: "secret" },
            { action: "click", selector: "#submit" },
          ],
        },
      ],
    };

    expect(flow.fragments).toHaveLength(1);
    expect(flow.fragments![0].name).toBe("login");
    expect(flow.fragments![0].steps).toHaveLength(3);
  });
});
