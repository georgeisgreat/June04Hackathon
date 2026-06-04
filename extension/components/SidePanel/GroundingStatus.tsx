import React from "react";
import type { ScoreResponse } from "../../types";

const LABEL_COLORS: Record<string, string> = {
  "Well Grounded": "#16a34a",
  "Mostly Grounded": "#ca8a04",
  "Weakly Grounded": "#ea580c",
  "High Hallucination Risk": "#dc2626",
};

export default function GroundingStatus({ score }: { score: ScoreResponse }) {
  const color = LABEL_COLORS[score.label] ?? "#6b7280";

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Grounding Status</span>
        <span style={{ fontSize: "11px", color: "#6b7280" }}>
          Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {score.drift_detected ? (
        <div style={{
          background: "#fff7ed",
          border: "1px solid #fdba74",
          borderRadius: "8px",
          padding: "10px 12px",
          display: "flex",
          gap: "8px",
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#c2410c" }}>
              Possible Drift Detected
            </div>
            <div style={{ fontSize: "12px", color: "#78350f", marginTop: "2px" }}>
              The latest answer may contradict pinned facts.
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: "#f0fdf4",
          border: `1px solid ${color}40`,
          borderRadius: "8px",
          padding: "10px 12px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}>
          <span style={{ fontSize: "18px" }}>✅</span>
          <div style={{ fontSize: "13px", fontWeight: 600, color }}>
            {score.label}
          </div>
        </div>
      )}
    </div>
  );
}
