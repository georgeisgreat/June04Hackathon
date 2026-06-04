import React, { useState, useEffect } from "react";
import type { ScoreResponse } from "../../types";
import GroundingStatus from "./GroundingStatus";
import ProvenanceChart from "./ProvenanceChart";
import PinnedFacts from "./PinnedFacts";
import AnswerSources from "./AnswerSources";
import ResponseAudit from "./ResponseAudit";
import Actions from "./Actions";

interface SidePanelProps {
  onMount: (setter: (s: ScoreResponse | null) => void) => void;
}

const PANEL_WIDTH = 360;

export default function SidePanel({ onMount }: SidePanelProps) {
  const [score, setScore] = useState<ScoreResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onMount((s) => {
      setScore(s);
      if (s) setOpen(true);
    });
  }, [onMount]);

  if (!open || !score) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: `${PANEL_WIDTH}px`,
        height: "100vh",
        background: "#fff",
        borderLeft: "1px solid #e5e7eb",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.08)",
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid #f3f4f6",
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🛡️</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>Context Monitor</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            color: "#6b7280",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px", flex: 1 }}>
        <GroundingStatus score={score} />
        <Divider />
        <ProvenanceChart provenance={score.provenance} />
        <Divider />
        <PinnedFacts />
        <Divider />
        <AnswerSources claims={score.claims} />
        <Divider />
        <ResponseAudit audit={score.audit} />
        <Divider />
        <Actions claims={score.claims} replyText="" />
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #f3f4f6", margin: "12px 0" }} />;
}
