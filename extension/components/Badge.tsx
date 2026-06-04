import React, { useState } from "react";
import type { ScoreResponse } from "../types";

interface BadgeProps {
  onMount: (
    scoreSetter: (s: ScoreResponse | null) => void,
    errSetter: (e: boolean) => void
  ) => void;
  onClick: () => void;
}

const LABEL_COLORS: Record<string, string> = {
  "Well Grounded": "#16a34a",
  "Mostly Grounded": "#ca8a04",
  "Weakly Grounded": "#ea580c",
  "High Hallucination Risk": "#dc2626",
  "Not Factual": "#6b7280",
};

export default function Badge({ onMount, onClick }: BadgeProps) {
  const [score, setScore] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    onMount(setScore, setError);
  }, [onMount]);

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.1)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
    userSelect: "none",
    transition: "opacity 0.15s",
  };

  if (error) {
    return (
      <span style={{ ...baseStyle, background: "#f3f4f6", color: "#6b7280" }}>
        ⚠ Check failed
      </span>
    );
  }

  if (!score) {
    return (
      <span style={{ ...baseStyle, background: "#f3f4f6", color: "#9ca3af" }}>
        <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
        Checking…
      </span>
    );
  }

  const color = LABEL_COLORS[score.label] ?? "#6b7280";
  const pct = Math.round(score.overall_score * 100);

  return (
    <span
      style={{ ...baseStyle, background: `${color}18`, color }}
      onClick={onClick}
      title="Click to view claim breakdown"
    >
      {score.drift_detected && (
        <span title="Drift detected" style={{ fontSize: "14px" }}>⚠</span>
      )}
      <span style={{ fontSize: "13px", fontWeight: 700 }}>{pct}</span>
      <span style={{ opacity: 0.85 }}>— {score.label}</span>
    </span>
  );
}
