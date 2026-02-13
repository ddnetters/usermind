import { describe, it, expect } from "vitest";
import { VERSION } from "@usermind/core";

describe("@usermind/cli", () => {
  it("can import from @usermind/core", () => {
    expect(VERSION).toBe("0.0.1");
  });
});
