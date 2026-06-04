import React from "react";
import ReactDOM from "react-dom/client";
import { startObserver } from "./observer";
import { getReplyText, getConversationContext } from "./adapter";
import { highlightContradictions } from "./highlighter";
import { getPinnedFacts } from "../../hooks/usePinnedFacts";
import Badge from "../../components/Badge";
import SidePanel from "../../components/SidePanel";
import type { MessageToBackground, MessageFromBackground, ScoreResponse } from "../../types";

export default defineContentScript({
  matches: ["https://chat.openai.com/*"],
  cssInjectionMode: "ui",

  async main() {
    // Mount the persistent side panel into a shadow host
    const panelHost = document.createElement("div");
    panelHost.id = "credcheck-panel-host";
    document.body.appendChild(panelHost);

    const panelShadow = panelHost.attachShadow({ mode: "open" });
    const panelContainer = document.createElement("div");
    panelShadow.appendChild(panelContainer);

    let setPanelScore: ((s: ScoreResponse | null) => void) | null = null;

    const panelRoot = ReactDOM.createRoot(panelContainer);
    panelRoot.render(
      React.createElement(SidePanel, {
        onMount: (setter: (s: ScoreResponse | null) => void) => {
          setPanelScore = setter;
        },
      })
    );

    // Track which turns already have a badge
    const processed = new WeakSet<Element>();

    startObserver(async (turnEl) => {
      if (processed.has(turnEl)) return;
      processed.add(turnEl);

      const text = getReplyText(turnEl);
      if (!text) return;

      // Mount badge into shadow DOM on the turn element
      const badgeHost = document.createElement("span");
      badgeHost.style.cssText = "position:absolute;top:8px;right:8px;z-index:9999;";
      (turnEl as HTMLElement).style.position = "relative";
      turnEl.appendChild(badgeHost);

      const badgeShadow = badgeHost.attachShadow({ mode: "open" });
      const badgeContainer = document.createElement("div");
      badgeShadow.appendChild(badgeContainer);

      let setBadgeScore: ((s: ScoreResponse | null) => void) | null = null;
      let setBadgeError: ((e: boolean) => void) | null = null;

      const badgeRoot = ReactDOM.createRoot(badgeContainer);
      badgeRoot.render(
        React.createElement(Badge, {
          onMount: (
            scoreSetter: (s: ScoreResponse | null) => void,
            errSetter: (e: boolean) => void
          ) => {
            setBadgeScore = scoreSetter;
            setBadgeError = errSetter;
          },
          onClick: () => {
            // Panel open is handled by state in SidePanel
          },
        })
      );

      const pinnedFacts = await getPinnedFacts();
      const context = getConversationContext();

      const msg: MessageToBackground = {
        type: "SCORE_REQUEST",
        text,
        pinnedFacts,
        conversationContext: context,
      };

      chrome.runtime.sendMessage(msg, (response: MessageFromBackground) => {
        if (!response || response.type === "SCORE_ERROR") {
          setBadgeError?.(true);
          return;
        }
        const score = response.payload!;
        setBadgeScore?.(score);
        setPanelScore?.(score);
        highlightContradictions(turnEl, score.claims);
      });
    });
  },
});
