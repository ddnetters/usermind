export const VERSION = "0.0.1";

export type {
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
} from "./dsl/index.js";

export { parseFlow, ParseError, ACTION_TYPES, REQUIRED_FIELDS } from "./dsl/index.js";
