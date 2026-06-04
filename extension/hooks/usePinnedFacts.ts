import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "credcheck_pinned_facts";

export function usePinnedFacts() {
  const [facts, setFacts] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      setFacts(result[STORAGE_KEY] ?? []);
    });
  }, []);

  const addFact = useCallback((fact: string) => {
    setFacts((prev) => {
      const next = [...prev, fact];
      chrome.storage.local.set({ [STORAGE_KEY]: next });
      return next;
    });
  }, []);

  const removeFact = useCallback((index: number) => {
    setFacts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      chrome.storage.local.set({ [STORAGE_KEY]: next });
      return next;
    });
  }, []);

  return { facts, addFact, removeFact };
}

// Non-hook helper for use in content script (outside React)
export async function getPinnedFacts(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] ?? []);
    });
  });
}
