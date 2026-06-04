import React from "react";
import type { Claim } from "../../types";

const SOURCE_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  latest_user_instruction: { icon: "👤", label: "Latest user instruction", color: "#6366f1" },
  message: { icon: "💬", label: "Message from earlier", color: "#22c55e" },
  pinned_fact: { icon: "📌", label: "Pinned fact", color: "#22c55e" },
  external: { icon: "🌐", label: "External source", color: "#f97316" },
};

export default function AnswerSources({ claims }: { claims: Claim[] }) {
  const allSources = claims.flatMap((c) =>
    c.sources.map((s) => ({ ...s, claimText: c.text, verdict: c.verdict }))
  );

  if (!allSources.length) return null;

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        What this answer used
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {allSources.slice(0, 6).map((s, i) => {
          const cfg = SOURCE_TYPE_CONFIG[s.type] ?? SOURCE_TYPE_CONFIG.external;
          const isContradiction = s.verdict === "contradicted";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
              }}
            >
              <span style={{ fontSize: "14px" }}>{cfg.icon}</span>
              <span style={{ color: "#374151", flex: 1 }}>{cfg.label}</span>
              <span style={{ fontSize: "16px" }}>{isContradiction ? "⚠️" : "✓"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
