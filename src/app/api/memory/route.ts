import { NextRequest } from "next/server";

function getOpenClaw(): { url: string; token: string } | null {
  const url = process.env.OPENCLAW_URL;
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function invokeOpenClawTool(
  oc: { url: string; token: string },
  tool: string,
  args: Record<string, unknown>,
) {
  const res = await fetch(`${oc.url}/tools/invoke`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${oc.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tool, args }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenClaw ${res.status}: ${text}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  const oc = getOpenClaw();
  if (!oc) {
    return Response.json(
      { error: "OpenClaw not configured. Set OPENCLAW_URL and OPENCLAW_GATEWAY_TOKEN." },
      { status: 503 },
    );
  }

  const query = req.nextUrl.searchParams.get("q") || "";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);

  try {
    const result = await invokeOpenClawTool(oc, "memory_recall", { query, limit });
    return Response.json({ ok: true, memories: result });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const oc = getOpenClaw();
  if (!oc) {
    return Response.json(
      { error: "OpenClaw not configured. Set OPENCLAW_URL and OPENCLAW_GATEWAY_TOKEN." },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, text, query, importance, category, memoryId } = body as {
    action?: "store" | "recall" | "forget";
    text?: string;
    query?: string;
    importance?: number;
    category?: string;
    memoryId?: string;
  };

  try {
    switch (action) {
      case "store": {
        if (!text) return Response.json({ error: "text required" }, { status: 400 });
        const result = await invokeOpenClawTool(oc, "memory_store", {
          text,
          importance: importance ?? 0.7,
          category: category ?? "fact",
        });
        return Response.json({ ok: true, result });
      }

      case "forget": {
        if (!query && !memoryId) {
          return Response.json({ error: "query or memoryId required" }, { status: 400 });
        }
        const args: Record<string, unknown> = {};
        if (query) args.query = query;
        if (memoryId) args.memoryId = memoryId;
        const result = await invokeOpenClawTool(oc, "memory_forget", args);
        return Response.json({ ok: true, result });
      }

      case "recall":
      default: {
        const result = await invokeOpenClawTool(oc, "memory_recall", {
          query: query || text || "",
          limit: 10,
        });
        return Response.json({ ok: true, memories: result });
      }
    }
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
}
