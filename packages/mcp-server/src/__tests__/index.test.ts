import { describe, it, expect } from "vitest";
import { VERSION } from "@usermind/core";

describe("@usermind/mcp-server", () => {
  it("can import from @usermind/core", () => {
    expect(VERSION).toBe("0.0.1");
  });
});
