import { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type ContentPiece, type ContentStatus } from "@/lib/pipeline";

const KV_KEY = "content_pipeline";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

async function getPipeline(sb: SupabaseClient): Promise<ContentPiece[]> {
  const { data } = await sb
    .from("kv_store")
    .select("value")
    .eq("key", KV_KEY)
    .maybeSingle();
  if (!data) return [];
  return (data as { value: ContentPiece[] }).value || [];
}

async function savePipeline(sb: SupabaseClient, items: ContentPiece[]) {
  await sb.from("kv_store").upsert(
    { key: KV_KEY, value: items as unknown, updated_at: new Date().toISOString() } as never,
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

  const items = await getPipeline(sb);
  const status = req.nextUrl.searchParams.get("status");
  const brand = req.nextUrl.searchParams.get("brand");

  let filtered = items;
  if (status) filtered = filtered.filter((i) => i.status === status);
  if (brand) filtered = filtered.filter((i) => i.brand === brand);

  const counts = {
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
    published: items.filter((i) => i.status === "published").length,
    total: items.length,
  };

  return Response.json({ items: filtered, counts });
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

  const { id, status, edited_text } = body as {
    id: string;
    status?: ContentStatus;
    edited_text?: string;
  };

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const items = await getPipeline(sb);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (status) items[idx].status = status;
  if (edited_text) {
    items[idx].edited_text = edited_text;
    items[idx].status = "edited";
  }
  items[idx].reviewed = new Date().toISOString();

  await savePipeline(sb, items);

  return Response.json({ ok: true, item: items[idx] });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { searchParams } = req.nextUrl;
  const clearStatus = searchParams.get("status");

  if (!clearStatus) {
    return Response.json({ error: "?status= required" }, { status: 400 });
  }

  const items = await getPipeline(sb);
  const filtered = items.filter((i) => i.status !== clearStatus);
  await savePipeline(sb, filtered);

  return Response.json({ ok: true, removed: items.length - filtered.length });
}
