import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "No Supabase" }, { status: 500 });

  const conversationId = request.nextUrl.searchParams.get("conversation_id");
  if (!conversationId) return NextResponse.json({ error: "conversation_id required" }, { status: 400 });

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

  const { data, error } = await supabase
    .from("agency_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}
