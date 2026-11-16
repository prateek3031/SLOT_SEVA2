// SSE reader for POST /api/chat/stream — the typed fetch layer doesn't stream, so this
// companion helper reads the body directly. Still a relative /api path (same origin).

import type { MiniDoctor } from "./types";

export interface ChatEvent {
  type: "start" | "delta" | "done";
  content?: string;
  reply?: string;
  urgency?: "routine" | "emergency";
  matches?: MiniDoctor[];
}

export async function streamChat(
  sessionId: string,
  message: string,
  onEvent: (e: ChatEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`chat stream failed with ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      try {
        onEvent(JSON.parse(line.slice(5).trim()) as ChatEvent);
      } catch {
        // skip malformed keep-alive chunks
      }
    }
  }
}
