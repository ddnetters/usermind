/**
 * Thrown when a YAML flow definition fails parsing or validation.
 */
export class ParseError extends Error {
  override readonly name = "ParseError";

  /** Dot-path to the invalid field (e.g. "steps[2].selector"). */
  readonly path: string | undefined;

  constructor(message: string, options?: { path?: string; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.path = options?.path;
  }
}
