"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type CareerChatProps = {
  profileId: number;
};

export default function CareerChat({ profileId }: CareerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const content = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content }]);

    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/v1/chat/${profileId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: content }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Chat request failed.");
      }

      const data = (await response.json()) as { response: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <h3 className="text-base font-semibold text-white">AI Career Chat</h3>
      <p className="mt-1 text-sm text-slate-300">
        Ask questions about your profile, skill gaps, and next steps.
      </p>

      <div
        ref={containerRef}
        className="mt-4 h-80 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/70 p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">
            Start the conversation by asking a question.
          </p>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm ${
              message.role === "user"
                ? "ml-auto bg-white text-slate-900"
                : "bg-white/10 text-slate-100"
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading ? <p className="text-xs text-slate-400">AI is thinking...</p> : null}
      </div>

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about skill gaps, roles, or roadmap..."
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:opacity-70"
        >
          Send
        </button>
      </div>
    </div>
  );
}
