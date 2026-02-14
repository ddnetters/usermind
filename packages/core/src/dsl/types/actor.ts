/**
 * Role-aware identity that the agent assumes during flow execution.
 */
export interface Actor {
  /** The role the agent assumes (e.g. "admin", "user", "visitor"). */
  role: string;
  /** Permissions associated with this role. */
  permissions?: string[];
  /** Key-value session data (credentials, test fixtures) interpolated at runtime. */
  session?: Record<string, string>;
}
