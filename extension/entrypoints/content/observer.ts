import { SELECTORS, isStreaming } from "./adapter";

type OnReplyComplete = (turnEl: Element) => void;

export function startObserver(onComplete: OnReplyComplete): MutationObserver {
  // Track turns that are currently streaming
  const streamingTurns = new WeakSet<Element>();

  const observer = new MutationObserver(() => {
    const turns = document.querySelectorAll(SELECTORS.assistantTurn);

    turns.forEach((turn) => {
      if (isStreaming(turn)) {
        streamingTurns.add(turn);
      } else if (streamingTurns.has(turn)) {
        // Was streaming, now complete
        streamingTurns.delete(turn);
        onComplete(turn);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return observer;
}
