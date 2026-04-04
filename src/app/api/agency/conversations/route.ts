import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) return NextResponse.json({ error: "No Supabase" }, { status: 500 });

  const { data, error } = await supabase
    .from("agency_conversations")
    .select("*")
    .eq("is_archived", false)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}
