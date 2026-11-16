import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { streamChat } from "@/lib/chatStream";
import { apiGet } from "@/lib/api";
import type { ChatMessage, MiniDoctor } from "@/lib/types";
import { inr } from "@/lib/format";
import { useTriage } from "./TriageContext";

const WELCOME: ChatMessage = {
  id: "welcome",
  session_id: "",
  user_id: null,
  role: "assistant",
  content:
    "SYS // SLOT SEVA TRIAGE ONLINE\n\nDescribe your problem — I'll map it to the right specialist and hand you their open slots. Example: 'sharp chest pain after climbing stairs' or 'itchy rash on my arm'.",
  matches: [],
  created_at: "",
};

// Slide-over terminal drawer: symptom in, streamed triage reply + bookable doctor matches out.
export default function TriageDrawer() {
  const { open, setOpen } = useTriage();
  const navigate = useNavigate();
  const [sessionId] = useState<string>(() => {
    const existing = localStorage.getItem("ss-chat-session");
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem("ss-chat-session", id);
    return id;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState<MiniDoctor[]>([]);
  const [urgency, setUrgency] = useState<"routine" | "emergency">("routine");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load persisted history the first time the drawer opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    apiGet<ChatMessage[]>(`/chat/history?session_id=${sessionId}`)
      .then((history) => {
        if (!cancelled && history.length > 0) setMessages([WELCOME, ...history]);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(): Promise<void> {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        session_id: sessionId,
        user_id: null,
        role: "user",
        content: text,
        matches: [],
        created_at: "",
      },
    ]);
    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        session_id: sessionId,
        user_id: null,
        role: "assistant",
        content: "",
        matches: [],
        created_at: "",
      },
    ]);
    try {
      await streamChat(sessionId, text, (event) => {
        if (event.type === "delta" && event.content) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + event.content } : m,
            ),
          );
        } else if (event.type === "done") {
          setUrgency(event.urgency ?? "routine");
          setMatches(event.matches ?? []);
          if (event.reply) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: event.reply as string } : m)),
            );
          }
        }
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || "LINK DOWN // triage engine unreachable — try again in a moment." }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-white/12 bg-[#0B0D14] p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <SheetTitle className="font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-400">
            ✦ Slot Seva // Symptom AI
          </SheetTitle>
          <SheetDescription className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            Triage assistant — suggests a specialisation, never a diagnosis
          </SheetDescription>
        </SheetHeader>

        <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap border px-3 py-2 font-mono text-[12px] leading-relaxed ${
                  m.role === "user"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                    : "border-white/12 bg-white/[0.04] text-zinc-200"
                }`}
              >
                {m.content || (busy ? "▍" : "")}
              </div>
            </div>
          ))}

          {matches.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                Recommended // book now
              </p>
              {matches.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between border border-white/12 bg-[#10121B] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-semibold text-zinc-100">{d.name}</p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      {d.specialisation} · {d.city} · {inr(d.fee)}
                    </p>
                  </div>
                  <Button
                    size="xs"
                    data-testid={`triage-book-${d.id}`}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/doctors/${d.id}`);
                    }}
                  >
                    BOOK ↗
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-3">
          {urgency === "emergency" && (
            <p className="mb-2 font-mono text-[11px] text-red-400" data-testid="triage-emergency-note">
              ⚠ POSSIBLE EMERGENCY — call 108 now.
            </p>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <Input
              data-testid="triage-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your problem…"
              className="border-white/15 bg-transparent font-mono text-sm"
            />
            <Button
              type="submit"
              size="sm"
              data-testid="triage-send-button"
              disabled={busy || !input.trim()}
            >
              SEND
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
