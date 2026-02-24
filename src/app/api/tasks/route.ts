import { NextRequest } from "next/server";
import { type CursorTask, type TaskStatus, generateTaskId } from "@/lib/tasks";
import { kvGet, kvSet, logAppend, chatSave, sendWebhook } from "@/lib/storage";

const KV_KEY = "cursor_tasks";

const STATUS_EMOJI: Record<TaskStatus, string> = {
  pending: "⏳",
  in_progress: "⚡",
  done: "✅",
  cancelled: "❌",
};

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await kvGet<CursorTask[]>(KV_KEY, []);

  const status = req.nextUrl.searchParams.get("status");
  const agent = req.nextUrl.searchParams.get("agent");
  const project = req.nextUrl.searchParams.get("project");

  let filtered = tasks;
  if (status) filtered = filtered.filter((t) => t.status === status);
  if (agent) filtered = filtered.filter((t) => t.agent === agent);
  if (project) filtered = filtered.filter((t) => t.project === project);

  return Response.json({ tasks: filtered, total: tasks.length });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    title, description, priority = "normal", project = "frogface",
    agent = "cursor", context, files, acceptance, quest_id,
  } = body;

  if (!title || !description) {
    return Response.json({ error: "title and description are required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const task: CursorTask = {
    id: generateTaskId(), title, status: "pending", priority, project, agent,
    description, context, files, acceptance, quest_id, created: now, updated: now,
  };

  const tasks = await kvGet<CursorTask[]>(KV_KEY, []);
  tasks.push(task);
  await kvSet(KV_KEY, tasks);
  await logAppend({ source: "tasks", type: "log", text: `Новая задача: ${task.title} [${task.id}] → ${task.agent}` });

  return Response.json({ ok: true, task });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status, result, ...rest } = body;
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const tasks = await kvGet<CursorTask[]>(KV_KEY, []);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return Response.json({ error: "Task not found" }, { status: 404 });

  const updated: CursorTask = {
    ...tasks[idx], ...rest,
    ...(status && { status }),
    ...(result && { result }),
    updated: new Date().toISOString(),
  };
  tasks[idx] = updated;
  await kvSet(KV_KEY, tasks);

  if (status) {
    const emoji = STATUS_EMOJI[status as TaskStatus] || "📋";
    const logText = `${emoji} Задача ${id}: ${updated.title} → ${status}`;
    await logAppend({ source: "tasks", type: "log", text: logText });
    await chatSave({ agent_id: "moltbot", role: "system", content: logText });
    await chatSave({ agent_id: "command", role: "system", content: logText });
    sendWebhook(logText);
  }

  return Response.json({ ok: true, task: updated, notified: !!status });
}
