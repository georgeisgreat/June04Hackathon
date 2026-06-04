export type SharedMessage = {
  id: string;
  room: string;
  author: string;
  content: string;
  kind: "text" | "context" | "summary" | "ai" | "system";
  timestamp: string;
  source?: {
    from: "private" | "shared";
    messageIds?: string[];
    label?: string;
  };
};

export type PrivateMessage = {
  id: string;
  role: "user" | "assistant";
  author: string;
  content: string;
  timestamp: string;
  selected?: boolean;
  shared?: boolean;
  kind?: "text" | "source-card" | "pulled-context";
};

export type ChatMode = "private" | "shared" | "summarize" | "pull-context";

export type ToastState = {
  id: string;
  message: string;
  tone?: "success" | "warning" | "info";
};
