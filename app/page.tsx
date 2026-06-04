"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CollaboratorModal } from "@/components/CollaboratorModal";
import { PrivateChat } from "@/components/PrivateChat";
import { SharedChat } from "@/components/SharedChat";
import { Sidebar } from "@/components/Sidebar";
import { Toast } from "@/components/Toast";
import { createAblyClient, getChannelName, hasAblyKey } from "@/lib/ably";
import { seedPrivateMessages, seedSharedMessages } from "@/lib/seed";
import type { PrivateMessage, SharedMessage, ToastState } from "@/lib/types";

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function selectedPrivateText(messages: PrivateMessage[]) {
  return messages
    .filter((message) => message.selected)
    .map((message) => `${message.author}: ${message.content}`)
    .join("\n\n");
}

function selectedSharedText(messages: SharedMessage[], selectedIds: string[]) {
  return messages
    .filter((message) => selectedIds.includes(message.id))
    .map((message) => `${message.author} (${message.kind}): ${message.content}`)
    .join("\n\n");
}

export default function Home() {
  const [room, setRoom] = useState("demo-room");
  const [userName, setUserName] = useState("Shreyas");
  const collaboratorName = userName.toLowerCase() === "emily" ? "Shreyas" : "Emily";

  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>(seedPrivateMessages);
  const [sharedMessages, setSharedMessages] = useState<SharedMessage[]>(() => seedSharedMessages("demo-room"));
  const [sharedOpen, setSharedOpen] = useState(false);
  const [collaboratorOpen, setCollaboratorOpen] = useState(false);
  const [privateInput, setPrivateInput] = useState("");
  const [sharedInput, setSharedInput] = useState("");
  const [privateLoading, setPrivateLoading] = useState(false);
  const [sharedSelectedIds, setSharedSelectedIds] = useState<string[]>([]);
  const [pulledContext, setPulledContext] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [origin, setOrigin] = useState("");
  const [realtimeReady, setRealtimeReady] = useState(false);

  const ablyRef = useRef<ReturnType<typeof createAblyClient>>(null);
  const channelRef = useRef<any>(null);
  const localChannelRef = useRef<BroadcastChannel | null>(null);

  const selectedCount = privateMessages.filter((message) => message.selected).length;
  const inviteUser = userName.toLowerCase() === "emily" ? "Shreyas" : "Emily";
  const inviteLink = origin
    ? `${origin}/?room=${encodeURIComponent(room)}&user=${encodeURIComponent(inviteUser)}&shared=1`
    : "";

  const showToast = useCallback((message: string, tone: ToastState["tone"] = "success") => {
    const nextToast = { id: id("toast"), message, tone };
    setToast(nextToast);
    window.setTimeout(() => {
      setToast((current) => (current?.id === nextToast.id ? null : current));
    }, 3600);
  }, []);

  const addSharedMessage = useCallback((message: SharedMessage) => {
    setSharedMessages((current) => {
      if (current.some((item) => item.id === message.id)) return current;
      return [...current, message];
    });
  }, []);

  const publishSharedMessage = useCallback(
    async (message: SharedMessage) => {
      addSharedMessage(message);
      localChannelRef.current?.postMessage(message);
      if (!channelRef.current) return;

      try {
        await channelRef.current.publish("shared-message", message);
      } catch {
        showToast("Realtime publish failed. Kept this message locally.", "warning");
      }
    },
    [addSharedMessage, showToast],
  );

  const handleIncomingSharedMessage = useCallback(
    (message: SharedMessage) => {
      if (!message?.id) return;
      addSharedMessage(message);

      if (
        message.kind === "system" &&
        message.source?.label === "collaboration-started" &&
        message.author !== userName
      ) {
        setSharedOpen(true);
        showToast(`${message.author} opened the shared context branch.`, "info");
      }
    },
    [addSharedMessage, showToast, userName],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextRoom = params.get("room") || "demo-room";
    const nextUser = params.get("user") || "Shreyas";
    const shouldOpenShared = params.get("shared") === "1" || nextUser.toLowerCase() === "emily";
    setRoom(nextRoom);
    setUserName(nextUser);
    setSharedOpen(shouldOpenShared);
    setOrigin(window.location.origin);
    setSharedMessages(seedSharedMessages(nextRoom));
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const localChannel = new BroadcastChannel(getChannelName(room));
    localChannelRef.current = localChannel;
    localChannel.onmessage = (event) => {
      handleIncomingSharedMessage(event.data as SharedMessage);
    };

    return () => {
      localChannel.close();
      localChannelRef.current = null;
    };
  }, [handleIncomingSharedMessage, room]);

  useEffect(() => {
    if (!hasAblyKey()) {
      setRealtimeReady(false);
      return;
    }

    let active = true;
    const client = createAblyClient(userName);
    ablyRef.current = client;

    if (!client) return;

    const channel = client.channels.get(getChannelName(room)) as any;
    channelRef.current = channel;

    const handler = (message: { data: unknown }) => {
      if (!active) return;
      const data = message.data as SharedMessage;
      handleIncomingSharedMessage(data);
    };

    channel.subscribe("shared-message", handler).then(() => {
      if (active) setRealtimeReady(true);
    }).catch(() => {
      if (active) setRealtimeReady(false);
    });

    return () => {
      active = false;
      setRealtimeReady(false);
      try {
        channel.unsubscribe("shared-message", handler);
      } catch {
        // Ignore Ably cleanup errors during fast refresh / tab changes.
      }
      client.close();
      channelRef.current = null;
      ablyRef.current = null;
    };
  }, [handleIncomingSharedMessage, room, userName]);

  const sharedContext = useMemo(
    () => sharedMessages.map((message) => `${message.author}: ${message.content}`).join("\n\n"),
    [sharedMessages],
  );

  async function callChatApi(payload: {
    mode: "private" | "shared" | "summarize" | "pull-context";
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    selectedContext?: string;
  }) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        sharedContext,
        pulledContext: pulledContext.join("\n\n"),
        userName,
        collaboratorName,
      }),
    });

    if (!response.ok) throw new Error("Chat request failed");
    return (await response.json()) as { content: string };
  }

  const togglePrivateSelect = (messageId: string) => {
    setPrivateMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, selected: !message.selected } : message,
      ),
    );
  };

  const markPrivateShared = (messageIds: string[]) => {
    setPrivateMessages((current) =>
      current.map((message) =>
        messageIds.includes(message.id) ? { ...message, selected: false, shared: true } : message,
      ),
    );
  };

  const pushPrivateMessages = async (messageIds?: string[]) => {
    const selected = privateMessages.filter((message) =>
      messageIds ? messageIds.includes(message.id) : message.selected,
    );
    if (!selected.length) return;

    setSharedOpen(true);

    for (const message of selected) {
      await publishSharedMessage({
        id: id("shared-context"),
        room,
        author: userName,
        content: `${message.author}: ${message.content}`,
        kind: "context",
        timestamp: new Date().toISOString(),
        source: {
          from: "private",
          messageIds: [message.id],
          label: "Pushed from private chat",
        },
      });
    }

    markPrivateShared(selected.map((message) => message.id));
    showToast(`Selected context shared with ${collaboratorName}.`);
  };

  const summarizeAndPushSelected = async (messageIds?: string[]) => {
    const selected = privateMessages.filter((message) =>
      messageIds ? messageIds.includes(message.id) : message.selected,
    );
    const selectedContext = messageIds
      ? selected.map((message) => `${message.author}: ${message.content}`).join("\n\n")
      : selectedPrivateText(privateMessages);
    if (!selectedContext || !selected.length) return;

    setSharedOpen(true);
    const result = await callChatApi({
      mode: "summarize",
      selectedContext,
      messages: [{ role: "user", content: selectedContext }],
    });

    await publishSharedMessage({
      id: id("shared-summary"),
      room,
      author: userName,
      content: result.content,
      kind: "summary",
      timestamp: new Date().toISOString(),
      source: {
        from: "private",
        messageIds: selected.map((message) => message.id),
        label: "Summarized from selected private history",
      },
    });

    markPrivateShared(selected.map((message) => message.id));
    showToast(`Selected context shared with ${collaboratorName}.`);
  };

  const sendPrivate = async () => {
    const content = privateInput.trim();
    if (!content || privateLoading) return;

    const userMessage: PrivateMessage = {
      id: id("private-user"),
      role: "user",
      author: userName,
      content,
      timestamp: nowLabel(),
    };

    const nextMessages = [...privateMessages, userMessage];
    setPrivateMessages(nextMessages);
    setPrivateInput("");
    setPrivateLoading(true);

    try {
      const result = await callChatApi({
        mode: "private",
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      setPrivateMessages((current) => [
        ...current,
        {
          id: id("private-assistant"),
          role: "assistant",
          author: "Copilot",
          content: result.content,
          timestamp: nowLabel(),
        },
      ]);
    } catch {
      setPrivateMessages((current) => [
        ...current,
        {
          id: id("private-assistant-fallback"),
          role: "assistant",
          author: "Copilot",
          content: "I hit a local API issue, but the private chat is still working. Check the dev console or API route logs when you have a minute.",
          timestamp: nowLabel(),
        },
      ]);
    } finally {
      setPrivateLoading(false);
    }
  };

  const sendShared = async () => {
    const content = sharedInput.trim();
    if (!content) return;

    setSharedInput("");
    await publishSharedMessage({
      id: id("shared-text"),
      room,
      author: userName,
      content,
      kind: "text",
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await callChatApi({
        mode: "shared",
        messages: [{ role: "user", content }],
      });
      await publishSharedMessage({
        id: id("shared-ai"),
        room,
        author: "ContextCollab AI",
        content: result.content,
        kind: "ai",
        timestamp: new Date().toISOString(),
      });
    } catch {
      showToast("Shared AI response failed, but your note was posted.", "warning");
    }
  };

  const pullSelectedShared = async () => {
    const selectedContext = selectedSharedText(sharedMessages, sharedSelectedIds);
    if (!selectedContext) return;

    const result = await callChatApi({
      mode: "pull-context",
      selectedContext,
      messages: [{ role: "user", content: selectedContext }],
    });

    setPulledContext((current) => [...current, result.content]);
    setPrivateMessages((current) => [
      ...current,
      {
        id: id("pulled-context"),
        role: "assistant",
        author: "ContextCollab",
        content: result.content,
        timestamp: nowLabel(),
        kind: "pulled-context",
      },
    ]);
    setSharedSelectedIds([]);
    showToast("Selected shared context pulled into your private chat.");
  };

  const toggleSharedSelect = (messageId: string) => {
    setSharedSelectedIds((current) =>
      current.includes(messageId)
        ? current.filter((idValue) => idValue !== messageId)
        : [...current, messageId],
    );
  };

  const startSharedChat = async () => {
    setCollaboratorOpen(false);
    setSharedOpen(true);
    const message: SharedMessage = {
      id: id("shared-started"),
      room,
      author: userName,
      content: `${userName} opened the shared context branch for this room.`,
      kind: "system",
      timestamp: new Date().toISOString(),
      source: {
        from: "shared",
        label: "collaboration-started",
      },
    };
    await publishSharedMessage(message);
    showToast(`Shared context branch opened with ${collaboratorName}.`);
  };

  const copyInvite = async () => {
    if (!inviteLink) return;
    await navigator.clipboard?.writeText(inviteLink);
    showToast("Emily invite link copied.");
  };

  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar userName={userName} />
      <PrivateChat
        userName={userName}
        collaboratorName={collaboratorName}
        messages={privateMessages}
        loading={privateLoading}
        selectedCount={selectedCount}
        pulledContext={pulledContext}
        inputValue={privateInput}
        onInputChange={setPrivateInput}
        onSend={sendPrivate}
        onCollaborate={() => setCollaboratorOpen(true)}
        onToggleSelect={togglePrivateSelect}
        onPushOne={(messageId) => pushPrivateMessages([messageId])}
        onSummarizeOne={(messageId) => summarizeAndPushSelected([messageId])}
        onPushSelected={() => pushPrivateMessages()}
        onSummarizeSelected={() => summarizeAndPushSelected()}
      />
      {sharedOpen ? (
        <SharedChat
          room={room}
          userName={userName}
          collaboratorName={collaboratorName}
          messages={sharedMessages}
          selectedIds={sharedSelectedIds}
          inputValue={sharedInput}
          realtimeReady={realtimeReady}
          inviteLink={inviteLink}
          onClose={() => setSharedOpen(false)}
          onInputChange={setSharedInput}
          onSend={sendShared}
          onToggleSelect={toggleSharedSelect}
          onPullSelected={pullSelectedShared}
          onCopyInvite={copyInvite}
        />
      ) : null}
      <CollaboratorModal
        open={collaboratorOpen}
        inviteLink={inviteLink}
        userName={userName}
        collaboratorName={collaboratorName}
        onClose={() => setCollaboratorOpen(false)}
        onStart={startSharedChat}
        onCopyInvite={copyInvite}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
