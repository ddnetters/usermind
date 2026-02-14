import { parse } from "yaml";
import type { Flow } from "../types/flow.js";
import { ParseError } from "./errors.js";
import { validateRawFlow } from "./validate.js";
import { normalizeFlow } from "./normalize.js";

/**
 * Parse a YAML string into a fully validated and normalised {@link Flow}.
 *
 * @throws {ParseError} on invalid YAML syntax or schema violations.
 */
export function parseFlow(yaml: string): Flow {
  let data: unknown;
  try {
    data = parse(yaml);
  } catch (err) {
    throw new ParseError("Invalid YAML syntax", { cause: err });
  }

  const raw = validateRawFlow(data);
  return normalizeFlow(raw);
}
