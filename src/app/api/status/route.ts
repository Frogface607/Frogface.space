import { NextRequest } from "next/server";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

async function checkOpenClaw(): Promise<{
  connected: boolean;
  url: string | null;
  health?: boolean;
}> {
  const url = process.env.OPENCLAW_URL;
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!url || !token) return { connected: false, url: null };

  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
    return { connected: true, url, health: res.ok };
  } catch {
    return { connected: false, url, health: false };
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const openclaw = await checkOpenClaw();

  const result: Record<string, unknown> = {
    system: "frogface",
    version: "2.0",
    timestamp: new Date().toISOString(),
    openrouter: !!process.env.OPENROUTER_API_KEY,
    openclaw: openclaw.connected,
    openclawHealth: openclaw.health ?? false,
    mode: openclaw.connected ? "openclaw" : process.env.OPENROUTER_API_KEY ? "openrouter-direct" : "offline",
  };

  return Response.json(result);
}
