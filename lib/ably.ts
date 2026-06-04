"use client";

import * as Ably from "ably";

export function hasAblyKey() {
  const credential = process.env.NEXT_PUBLIC_ABLY_KEY?.trim();
  return Boolean(credential && credential.includes(":"));
}

export function createAblyClient(clientId: string) {
  const credential = process.env.NEXT_PUBLIC_ABLY_KEY?.trim();
  if (!credential || !credential.includes(":")) return null;

  try {
    return new Ably.Realtime({
      key: credential,
      clientId,
    });
  } catch {
    return null;
  }
}

export function getChannelName(room: string) {
  return `contextcollab:${room}`;
}
