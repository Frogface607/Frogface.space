import { NextRequest } from "next/server";

const MODEL_MAP: Record<string, string> = {
  "Claude Sonnet 4": "anthropic/claude-sonnet-4-20250514",
  "Claude Opus": "anthropic/claude-opus-4-20250514",
  "Claude Haiku": "anthropic/claude-3.5-haiku-20241022",
  "FreePik API": "anthropic/claude-3.5-haiku-20241022",
};

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-20250514";

interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { messages, model: modelLabel } = body as { messages: ChatMsg[]; model?: string };

  if (!messages?.length) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  const model = (modelLabel && MODEL_MAP[modelLabel]) || DEFAULT_MODEL;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://frogface.space",
      "X-Title": "Frogface Studio",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return Response.json({ error: `OpenRouter error: ${response.status}`, details: text }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
