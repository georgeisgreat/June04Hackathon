import React from "react";
import type { ProvenanceBreakdown } from "../../types";

const SEGMENTS = [
  { key: "user_instructions", label: "User Instructions", color: "#6366f1" },
  { key: "uploaded_docs", label: "Uploaded Docs", color: "#3b82f6" },
  { key: "prior_messages", label: "Prior Messages", color: "#22c55e" },
  { key: "model_assumptions", label: "Model Assumptions", color: "#f97316" },
  { key: "external_knowledge", label: "External Knowledge", color: "#94a3b8" },
] as const;

function DonutChart({ data }: { data: ProvenanceBreakdown }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 100;
  const r = 40;
  const cx = 52;
  const cy = 52;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const slices = SEGMENTS.map(({ key, color }) => {
    const pct = (data[key] ?? 0) / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const slice = { offset, dash, gap, color };
    offset += dash;
    return slice;
  });

  return (
    <svg width="104" height="104" viewBox="0 0 104 104">
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="18"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">
        100%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#6b7280">
        Total
      </text>
    </svg>
  );
}

export default function ProvenanceChart({ provenance }: { provenance: ProvenanceBreakdown }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        Provenance Breakdown
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <DonutChart data={provenance} />
        <div style={{ flex: 1 }}>
          {SEGMENTS.map(({ key, label, color }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
                <span style={{ fontSize: "11px", color: "#374151" }}>{label}</span>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#111827" }}>
                {provenance[key]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
