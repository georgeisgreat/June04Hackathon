export type Verdict = "supported" | "contradicted" | "unverified";

export interface Source {
  url: string;
  snippet: string;
  type: "external" | "pinned_fact" | "latest_user_instruction" | "message";
}

export interface Claim {
  text: string;
  verdict: Verdict;
  confidence: number;
  sources: Source[];
}

export interface ProvenanceBreakdown {
  user_instructions: number;
  uploaded_docs: number;
  prior_messages: number;
  model_assumptions: number;
  external_knowledge: number;
}

export interface AuditCounts {
  grounded: number;
  assumption: number;
  unsupported: number;
  contradiction: number;
}

export interface ScoreResponse {
  overall_score: number;
  label: string;
  drift_detected: boolean;
  provenance: ProvenanceBreakdown;
  claims: Claim[];
  audit: AuditCounts;
}

export type BadgeState = "loading" | "ready" | "error";

export interface MessageToBackground {
  type: "SCORE_REQUEST";
  text: string;
  pinnedFacts: string[];
  conversationContext: string;
}

export interface MessageFromBackground {
  type: "SCORE_RESPONSE" | "SCORE_ERROR";
  payload?: ScoreResponse;
  error?: string;
}
