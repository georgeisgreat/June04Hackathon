import React from "react";
import type { AuditCounts } from "../../types";

const AUDIT_ROWS: { key: keyof AuditCounts; label: string; color: string }[] = [
  { key: "grounded", label: "Grounded", color: "#16a34a" },
  { key: "assumption", label: "Assumption", color: "#f97316" },
  { key: "unsupported", label: "Unsupported", color: "#f97316" },
  { key: "contradiction", label: "Contradiction", color: "#dc2626" },
];

export default function ResponseAudit({ audit }: { audit: AuditCounts }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        Response Audit
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {AUDIT_ROWS.map(({ key, label, color }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: "12px", color: "#374151" }}>{label}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{audit[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
