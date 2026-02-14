import { describe, it, expect, expectTypeOf } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  EvidenceBundle,
  BundleStatus,
  EvidenceStepResult,
  StepResultStatus,
  EvidenceError,
} from "../index.js";

describe("Evidence type definitions", () => {
  it("exports all evidence types from the package root", () => {
    expectTypeOf<EvidenceBundle>().toBeObject();
    expectTypeOf<EvidenceStepResult>().toBeObject();
    expectTypeOf<EvidenceError>().toBeObject();
    expectTypeOf<BundleStatus>().toBeString();
    expectTypeOf<StepResultStatus>().toBeString();
  });

  it("represents a complete evidence bundle", () => {
    const bundle: EvidenceBundle = {
      flowName: "login-flow",
      sessionId: "sess-abc-123",
      actor: { role: "admin", permissions: ["read", "write"] },
      startedAt: "2025-01-15T10:00:00.000Z",
      finishedAt: "2025-01-15T10:00:05.000Z",
      status: "passed",
      steps: [
        {
          stepIndex: 0,
          action: "navigate",
          target: "https://example.com/login",
          result: "passed",
          timestamp: "2025-01-15T10:00:01.000Z",
          screenshot: "screenshots/step-0.png",
          durationMs: 1200,
        },
        {
          stepIndex: 1,
          action: "fill",
          target: "#email",
          result: "passed",
          timestamp: "2025-01-15T10:00:02.000Z",
          screenshot: null,
        },
      ],
      errors: [],
    };

    expect(bundle.flowName).toBe("login-flow");
    expect(bundle.actor.role).toBe("admin");
    expect(bundle.steps).toHaveLength(2);
    expect(bundle.steps[0].screenshot).toBe("screenshots/step-0.png");
    expect(bundle.steps[1].screenshot).toBeNull();
  });

  it("represents a running bundle with null finishedAt", () => {
    const bundle: EvidenceBundle = {
      flowName: "checkout-flow",
      sessionId: "sess-def-456",
      actor: { role: "user" },
      startedAt: "2025-01-15T10:00:00.000Z",
      finishedAt: null,
      status: "running",
      steps: [],
      errors: [],
    };

    expect(bundle.finishedAt).toBeNull();
    expect(bundle.status).toBe("running");
  });

  it("represents a failed bundle with errors", () => {
    const bundle: EvidenceBundle = {
      flowName: "search-flow",
      sessionId: "sess-ghi-789",
      actor: { role: "visitor" },
      startedAt: "2025-01-15T10:00:00.000Z",
      finishedAt: "2025-01-15T10:00:03.000Z",
      status: "failed",
      steps: [
        {
          stepIndex: 0,
          action: "navigate",
          target: "https://example.com",
          result: "passed",
          timestamp: "2025-01-15T10:00:01.000Z",
          screenshot: null,
        },
        {
          stepIndex: 1,
          action: "assert",
          target: "h1",
          result: "failed",
          timestamp: "2025-01-15T10:00:02.000Z",
          screenshot: "screenshots/step-1.png",
          durationMs: 50,
        },
      ],
      errors: [
        {
          code: "AssertionError",
          message: 'Expected "Welcome" but found "Error"',
          stepIndex: 1,
          timestamp: "2025-01-15T10:00:02.000Z",
        },
      ],
    };

    expect(bundle.status).toBe("failed");
    expect(bundle.errors).toHaveLength(1);
    expect(bundle.errors[0].stepIndex).toBe(1);
  });

  it("represents a flow-level error with null stepIndex", () => {
    const error: EvidenceError = {
      code: "SessionError",
      message: "Browser crashed unexpectedly",
      stepIndex: null,
      timestamp: "2025-01-15T10:00:00.000Z",
      details: "Chrome process exited with code 139",
    };

    expect(error.stepIndex).toBeNull();
    expect(error.details).toBeDefined();
  });

  it("covers all BundleStatus values", () => {
    const statuses: BundleStatus[] = ["passed", "failed", "error", "running"];
    expect(statuses).toHaveLength(4);
  });

  it("covers all StepResultStatus values", () => {
    const statuses: StepResultStatus[] = [
      "passed",
      "failed",
      "error",
      "skipped",
    ];
    expect(statuses).toHaveLength(4);
  });
});

describe("Evidence bundle JSON Schema", () => {
  let schema: Record<string, unknown>;

  it("is valid JSON", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    const raw = await readFile(schemaPath, "utf-8");
    schema = JSON.parse(raw);
    expect(schema).toBeDefined();
  });

  it("uses draft 2020-12", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    schema = JSON.parse(await readFile(schemaPath, "utf-8"));
    expect(schema.$schema).toBe(
      "https://json-schema.org/draft/2020-12/schema",
    );
  });

  it("requires all top-level bundle fields", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    schema = JSON.parse(await readFile(schemaPath, "utf-8"));
    const required = schema.required as string[];
    expect(required).toContain("flowName");
    expect(required).toContain("sessionId");
    expect(required).toContain("actor");
    expect(required).toContain("startedAt");
    expect(required).toContain("finishedAt");
    expect(required).toContain("status");
    expect(required).toContain("steps");
    expect(required).toContain("errors");
  });

  it("disallows additional properties on all objects", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    schema = JSON.parse(await readFile(schemaPath, "utf-8"));

    expect(schema.additionalProperties).toBe(false);

    const defs = schema.$defs as Record<string, Record<string, unknown>>;
    for (const [name, def] of Object.entries(defs)) {
      if (def.type === "object") {
        expect(
          def.additionalProperties,
          `$defs.${name} should disallow additional properties`,
        ).toBe(false);
      }
    }
  });

  it("defines all expected $defs", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    schema = JSON.parse(await readFile(schemaPath, "utf-8"));
    const defs = schema.$defs as Record<string, unknown>;
    expect(Object.keys(defs).sort()).toEqual([
      "ActionType",
      "Actor",
      "BundleStatus",
      "EvidenceError",
      "EvidenceStepResult",
      "StepResultStatus",
    ]);
  });

  it("defines BundleStatus enum values matching TypeScript type", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    schema = JSON.parse(await readFile(schemaPath, "utf-8"));
    const defs = schema.$defs as Record<
      string,
      Record<string, unknown>
    >;
    const bundleStatus = defs.BundleStatus;
    expect(bundleStatus.enum).toEqual(["passed", "failed", "error", "running"]);
  });

  it("defines StepResultStatus enum values matching TypeScript type", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    schema = JSON.parse(await readFile(schemaPath, "utf-8"));
    const defs = schema.$defs as Record<
      string,
      Record<string, unknown>
    >;
    const stepStatus = defs.StepResultStatus;
    expect(stepStatus.enum).toEqual(["passed", "failed", "error", "skipped"]);
  });

  it("defines ActionType enum matching DSL action types", async () => {
    const schemaPath = resolve(
      import.meta.dirname,
      "../../schemas/evidence-bundle.schema.json",
    );
    schema = JSON.parse(await readFile(schemaPath, "utf-8"));
    const defs = schema.$defs as Record<
      string,
      Record<string, unknown>
    >;
    const actionType = defs.ActionType;
    expect(actionType.enum).toEqual([
      "navigate",
      "click",
      "fill",
      "assert",
      "select",
      "hover",
      "wait",
    ]);
  });
});
