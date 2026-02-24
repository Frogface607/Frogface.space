import { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/storage";

const KV_KEY = "ff_hq_quests";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const quests = await kvGet(KV_KEY, []);
  return Response.json({ quests });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, project = "General", xp = 100, priority = "normal" } = body;

  if (!title) return Response.json({ error: "title is required" }, { status: 400 });

  const quests = await kvGet<unknown[]>(KV_KEY, []);
  const newQuest = {
    id: `q_${Date.now()}`, title, project, xp, priority, progress: 0, done: false,
  };
  quests.push(newQuest);
  await kvSet(KV_KEY, quests);

  return Response.json({ ok: true, quest: newQuest });
}
