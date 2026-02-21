import { NextRequest } from "next/server";

const MODEL_MAP: Record<string, string> = {
  "Claude Sonnet 4": "anthropic/claude-sonnet-4",
  "Claude Opus": "anthropic/claude-sonnet-4",
  "Claude Haiku": "anthropic/claude-haiku-4.5",
  "FreePik API": "anthropic/claude-haiku-4.5",
};

const DEFAULT_MODEL = "anthropic/claude-sonnet-4";

interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function GET() {
  const hasKey = !!process.env.OPENROUTER_API_KEY;
  const keyPrefix = hasKey ? process.env.OPENROUTER_API_KEY!.slice(0, 12) + "..." : "NOT SET";
  return Response.json({ status: "ok", hasKey, keyPrefix });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENROUTER_API_KEY not configured. Add it in Vercel Environment Variables and redeploy." },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages, model: modelLabel } = body as { messages: ChatMsg[]; model?: string };

  if (!messages?.length) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const model = (modelLabel && MODEL_MAP[modelLabel]) || DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
  } catch (err) {
    return Response.json(
      { error: "Failed to reach OpenRouter", details: String(err) },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const text = await response.text();
    return Response.json(
      { error: `OpenRouter ${response.status}`, details: text, model },
      { status: 502 },
    );
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
              // skip malformed SSE chunks
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
