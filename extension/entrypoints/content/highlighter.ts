import type { Claim } from "../../types";

const HIGHLIGHT_CLASS = "cc-contradiction-highlight";

export function highlightContradictions(turnEl: Element, claims: Claim[]): void {
  const prose = turnEl.querySelector(".markdown.prose");
  if (!prose) return;

  const contradicted = claims
    .filter((c) => c.verdict === "contradicted")
    .map((c) => c.text);

  if (!contradicted.length) return;

  highlightTextNodes(prose, contradicted);
}

function highlightTextNodes(root: Element, phrases: string[]): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const toReplace: { node: Text; phrase: string }[] = [];

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    for (const phrase of phrases) {
      // Match the core noun phrase — fuzzy substring match
      const core = phrase.slice(0, 40);
      if (node.textContent?.includes(core)) {
        toReplace.push({ node, phrase: core });
        break;
      }
    }
  }

  for (const { node, phrase } of toReplace) {
    const text = node.textContent ?? "";
    const idx = text.indexOf(phrase);
    if (idx === -1) continue;

    const before = document.createTextNode(text.slice(0, idx));
    const mark = document.createElement("mark");
    mark.className = HIGHLIGHT_CLASS;
    mark.style.cssText =
      "background:transparent;color:#ef4444;font-weight:600;border-bottom:2px solid #ef4444;";
    mark.textContent = text.slice(idx, idx + phrase.length);
    const after = document.createTextNode(text.slice(idx + phrase.length));

    node.parentNode?.replaceChild(after, node);
    node.parentNode?.insertBefore(mark, after);
    node.parentNode?.insertBefore(before, mark);
  }
}

export function clearHighlights(turnEl: Element): void {
  turnEl.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.replaceWith(document.createTextNode(el.textContent ?? ""));
  });
}
