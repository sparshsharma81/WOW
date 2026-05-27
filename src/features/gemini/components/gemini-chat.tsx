"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Sparkles, SendHorizonal, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

interface GeminiChatProps {
  storageKey?: string;
}

const starterPrompts = [
  "Summarize this workspace in a few bullets.",
  "Help me plan the next sprint for this project.",
  "Turn this idea into a task checklist.",
  "Say Hello to Sparsh Sharma",
];

export const GeminiChat = ({ storageKey = "wow-gemini-chat-history" }: GeminiChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const apiMessages = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        content: message.content,
      })),
    [messages],
  );

  useEffect(() => {
    const storedMessages = localStorage.getItem(storageKey);

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setPrompt("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...apiMessages, { role: "user", content: trimmed }],
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to respond.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.data.reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Error: Unable to respond.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(prompt);
  };

  return (
    <div className="grid min-h-[calc(100vh-10rem)] gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b bg-gradient-to-r from-accent/10 via-background to-background px-5 py-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <Sparkles className="size-3.5" />
              Gemini Assistant
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Chat with Gemini inside WOW
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Ask for summaries, planning help, task breakdowns, or quick ideas without leaving your workspace.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMessages([])}
            disabled={loading && messages.length === 0}
          >
            <RotateCcw className="mr-2 size-4" />
            Clear
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
              <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Bot className="size-7" />
              </div>
              <h3 className="text-lg font-semibold">Start a conversation</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Use one of the quick prompts below or ask anything about your work.
              </p>
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  message.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "border bg-background text-foreground",
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <span className="size-2 rounded-full bg-accent animate-pulse" />
                Thinking with Gemini...
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t bg-background/80 px-5 py-4 backdrop-blur"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask Gemini something..."
              className="h-12 flex-1 rounded-xl"
              disabled={loading}
            />
            <Button type="submit" size="lg" disabled={loading || !prompt.trim()}>
              <SendHorizonal className="mr-2 size-4" />
              Send
            </Button>
          </div>
        </form>
      </div>

      <aside className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Quick prompts
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            Make Gemini useful for your workflow
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            These prompts are a good starting point for planning, writing, and breaking work into smaller pieces.
          </p>
        </div>

        <div className="space-y-3">
          {starterPrompts.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPrompt(item)}
              className="w-full rounded-xl border bg-background px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-accent/40 hover:bg-accent/5"
              disabled={loading}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          The chat history is saved locally in your browser, so you can keep iterating on prompts while you work.
        </div>
      </aside>
    </div>
  );
};
