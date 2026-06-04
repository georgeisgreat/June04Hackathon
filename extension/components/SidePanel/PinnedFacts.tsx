import React, { useState } from "react";
import { usePinnedFacts } from "../../hooks/usePinnedFacts";

export default function PinnedFacts() {
  const { facts, addFact, removeFact } = usePinnedFacts();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed) {
      addFact(trimmed);
      setInput("");
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Pinned Facts</span>
        <button
          onClick={() => {
            const fact = prompt("Enter a fact to pin:");
            if (fact?.trim()) addFact(fact.trim());
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            color: "#6b7280",
            padding: "0 4px",
            lineHeight: 1,
          }}
          title="Add pinned fact"
        >
          +
        </button>
      </div>

      {facts.length === 0 ? (
        <div style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
          No pinned facts yet. Add facts to detect drift.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {facts.map((fact, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#f0fdf4",
                borderRadius: "6px",
                padding: "5px 8px",
              }}
            >
              <span style={{ color: "#16a34a", fontSize: "14px" }}>✓</span>
              <span style={{ flex: 1, fontSize: "12px", color: "#111827" }}>{fact}</span>
              <button
                onClick={() => removeFact(i)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "12px",
                  padding: "0",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
