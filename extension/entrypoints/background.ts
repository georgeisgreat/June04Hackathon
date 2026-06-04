import { fetchScore } from "../lib/api";
import type { MessageToBackground, MessageFromBackground } from "../types";

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener(
    (message: MessageToBackground, _sender, sendResponse) => {
      if (message.type !== "SCORE_REQUEST") return false;

      fetchScore(message.text, message.pinnedFacts, message.conversationContext)
        .then((payload) => {
          const response: MessageFromBackground = {
            type: "SCORE_RESPONSE",
            payload,
          };
          sendResponse(response);
        })
        .catch((err: Error) => {
          const response: MessageFromBackground = {
            type: "SCORE_ERROR",
            error: err.message,
          };
          sendResponse(response);
        });

      // Return true to keep the message channel open for async response
      return true;
    }
  );
});
