import { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type CursorTask, generateTaskId } from "@/lib/tasks";

const KV_KEY = "cursor_tasks";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

type SB = SupabaseClient;

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

async function getTasks(sb: SB): Promise<CursorTask[]> {
  const { data } = await sb
    .from("kv_store")
    .select("value")
    .eq("key", KV_KEY)
    .maybeSingle();
  if (!data) return [];
  return (data as { value: CursorTask[] }).value || [];
}

async function saveTasks(sb: SB, tasks: CursorTask[]) {
  await sb.from("kv_store").upsert(
    { key: KV_KEY, value: tasks as unknown, updated_at: new Date().toISOString() } as never,
  );
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const tasks = await getTasks(sb);

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
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    title,
    description,
    priority = "normal",
    project = "frogface",
    agent = "cursor",
    context,
    files,
    acceptance,
    quest_id,
  } = body;

  if (!title || !description) {
    return Response.json({ error: "title and description are required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const task: CursorTask = {
    id: generateTaskId(),
    title,
    status: "pending",
    priority,
    project,
    agent,
    description,
    context,
    files,
    acceptance,
    quest_id,
    created: now,
    updated: now,
  };

  const tasks = await getTasks(sb);
  tasks.push(task);
  await saveTasks(sb, tasks);

  await sb.from("activity_log").insert(
    { source: "tasks", type: "log", text: `Новая задача: ${task.title} [${task.id}] → ${task.agent}` } as never,
  );

  return Response.json({ ok: true, task });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status, result, ...rest } = body;

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const tasks = await getTasks(sb);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const updated = {
    ...tasks[idx],
    ...rest,
    ...(status && { status }),
    ...(result && { result }),
    updated: new Date().toISOString(),
  };
  tasks[idx] = updated;
  await saveTasks(sb, tasks);

  if (status) {
    await sb.from("activity_log").insert(
      { source: "tasks", type: "log", text: `Задача ${id}: ${tasks[idx].title} → ${status}` } as never,
    );
  }

  return Response.json({ ok: true, task: updated });
}
