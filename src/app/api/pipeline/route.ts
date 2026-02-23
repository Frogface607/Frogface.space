import { NextRequest } from "next/server";
import { type ContentPiece, type ContentStatus } from "@/lib/pipeline";
import { kvGet, kvSet } from "@/lib/storage";

const KV_KEY = "content_pipeline";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const items = await kvGet<ContentPiece[]>(KV_KEY, []);
  const status = req.nextUrl.searchParams.get("status");
  const brand = req.nextUrl.searchParams.get("brand");

  let filtered = items;
  if (status) filtered = filtered.filter((i) => i.status === status);
  if (brand) filtered = filtered.filter((i) => i.brand === brand);

  return Response.json({
    items: filtered,
    counts: {
      pending: items.filter((i) => i.status === "pending").length,
      approved: items.filter((i) => i.status === "approved").length,
      rejected: items.filter((i) => i.status === "rejected").length,
      published: items.filter((i) => i.status === "published").length,
      total: items.length,
    },
  });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status, edited_text } = body as { id: string; status?: ContentStatus; edited_text?: string };
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });

  const items = await kvGet<ContentPiece[]>(KV_KEY, []);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });

  if (status) items[idx].status = status;
  if (edited_text) { items[idx].edited_text = edited_text; items[idx].status = "edited"; }
  items[idx].reviewed = new Date().toISOString();

  await kvSet(KV_KEY, items);
  return Response.json({ ok: true, item: items[idx] });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const clearStatus = req.nextUrl.searchParams.get("status");
  if (!clearStatus) return Response.json({ error: "?status= required" }, { status: 400 });

  const items = await kvGet<ContentPiece[]>(KV_KEY, []);
  const filtered = items.filter((i) => i.status !== clearStatus);
  await kvSet(KV_KEY, filtered);

  return Response.json({ ok: true, removed: items.length - filtered.length });
}
