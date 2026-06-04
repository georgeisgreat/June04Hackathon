import React from "react";
import { usePinnedFacts } from "../../hooks/usePinnedFacts";
import type { Claim } from "../../types";

interface ActionsProps {
  claims: Claim[];
  replyText: string;
}

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  fontWeight: 500,
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "6px 10px",
  cursor: "pointer",
  background: "#fff",
  color: "#374151",
  width: "100%",
  textAlign: "left",
};

export default function Actions({ claims, replyText }: ActionsProps) {
  const { addFact } = usePinnedFacts();

  const handlePinFact = () => {
    const fact = prompt("Which fact do you want to pin?");
    if (fact?.trim()) addFact(fact.trim());
  };

  const handleAskForEvidence = () => {
    const contradicted = claims.filter((c) => c.verdict === "contradicted");
    const target = contradicted[0]?.text ?? claims[0]?.text;
    if (!target) return;

    const input = document.querySelector<HTMLTextAreaElement>("#prompt-textarea");
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, `Can you provide sources for: "${target}"?`);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
  };

  const handleRegenerateWithFacts = async () => {
    const { getPinnedFacts } = await import("../../hooks/usePinnedFacts");
    const facts = await getPinnedFacts();
    if (!facts.length) {
      alert("No pinned facts. Pin some facts first to guide regeneration.");
      return;
    }
    const instruction = `Please regenerate your last answer keeping these constraints:\n${facts.map((f) => `- ${f}`).join("\n")}`;
    const input = document.querySelector<HTMLTextAreaElement>("#prompt-textarea");
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, instruction);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
  };

  return (
    <div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        Actions
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
        <button style={btnBase} onClick={handlePinFact}>
          <span>📌</span> Pin Fact
        </button>
        <button style={btnBase} onClick={() => {}}>
          <span>🚫</span> Ignore Source
        </button>
        <button style={btnBase} onClick={handleAskForEvidence}>
          <span>❓</span> Ask for Evidence
        </button>
      </div>
      <button
        style={{
          ...btnBase,
          background: "#4f46e5",
          color: "#fff",
          border: "none",
          justifyContent: "center",
          fontWeight: 600,
          padding: "8px",
        }}
        onClick={handleRegenerateWithFacts}
      >
        ✨ Regenerate with Pinned Facts
      </button>
    </div>
  );
}
