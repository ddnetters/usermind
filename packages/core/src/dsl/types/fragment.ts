import type { Step } from "./step.js";

/**
 * A reusable group of steps that can be composed into flows.
 */
export interface Fragment {
  /** Unique name used to reference this fragment from a flow. */
  name: string;
  /** The steps this fragment expands into. */
  steps: Step[];
  /** Optional condition that gates inclusion of this fragment. */
  condition?: string;
}
