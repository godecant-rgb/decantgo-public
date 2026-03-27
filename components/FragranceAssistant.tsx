"use client";

import { useState } from "react";

type AssistantResponse = {
  reply?: string;
  error?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function FragranceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy tu asistente de fragancias. Contame qué tipo de perfume buscás y te recomiendo opciones reales del catálogo.",
    },
  ]);

  async function sendMessage() {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const nextConversation: ChatMessage[] = [
      ...conversation,
      { role: "user", content: trimmed },
    ];

    setConversation(nextConversation);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/fragrance-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data: AssistantResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo consultar el asistente.");
      }

      setConversation([
        ...nextConversation,
        {
          role: "assistant",
          content:
            data.reply ||
            "Encontré algunas opciones, pero no pude responder bien esta vez.",
        },
      ]);
    } catch (error: any) {
      setConversation([
        ...nextConversation,
        {
          role: "assistant",
          content:
            error?.message ||
            "Ocurrió un error al consultar el asistente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 left-5 z-50 w-[calc(100vw-2.5rem)] max-w-[380px] rounded-[28px] border border-[rgba(223,190,86,0.16)] bg-[rgba(28,22,17,0.96)] shadow-[0_18px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3 border-b border-[rgba(223,190,86,0.12)] px-5 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#bfa66a]">
                Asistente IA
              </p>
              <h2 className="mt-1 text-lg font-bold text-[#f4e7c3]">
                Te ayudo a elegir
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#e2cf9b]">
                Recomendaciones personalizadas del catálogo
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(223,190,86,0.14)] bg-[rgba(255,248,235,0.04)] text-sm text-[#f4e7c3] transition hover:border-[rgba(223,190,86,0.28)] hover:bg-[rgba(223,190,86,0.06)]"
              aria-label="Cerrar asistente"
            >
              ✕
            </button>
          </div>

          <div className="px-4 pb-4 pt-4">
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      msg.role === "user"
                        ? "bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] text-black"
                        : "border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] text-[#f4e7c3]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.05)] px-4 py-3 text-sm text-[#e2cf9b]">
                    Analizando el catálogo...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  "Masculino, dulce y nocturno",
                  "Fresco para verano",
                  "Algo elegante para salida",
                  "Unisex con vainilla",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setMessage(suggestion)}
                    className="rounded-full border border-[rgba(223,190,86,0.12)] bg-[rgba(255,248,235,0.04)] px-3 py-2 text-[11px] text-[#e2cf9b] transition hover:border-[rgba(223,190,86,0.24)] hover:bg-[rgba(223,190,86,0.06)] hover:text-[#fff1c7]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                placeholder="Ej: Quiero algo masculino, dulce y para la noche"
                className="w-full resize-none rounded-2xl border border-[rgba(223,190,86,0.16)] bg-[#1b1611] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#b59a5d] focus:border-[#dfbe56]"
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] leading-5 text-[#bfa66a]">
                  Enter para enviar
                </p>

                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="rounded-full bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-5 py-2.5 text-sm font-bold text-black shadow-[0_12px_28px_rgba(223,190,86,0.16)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Consultando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-5 z-50 inline-flex items-center gap-3 rounded-full border border-[rgba(223,190,86,0.20)] bg-[linear-gradient(135deg,#dfbe56_0%,#c89219_100%)] px-5 py-3 text-sm font-bold text-black shadow-[0_16px_35px_rgba(223,190,86,0.22)] transition hover:scale-[1.03]"
      >
        <span className="text-base">✦</span>
        Asistente IA
      </button>
    </>
  );
}