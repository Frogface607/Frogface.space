import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 500 });
  }

  const body = await request.json();
  const { frog_id } = body;

  if (!frog_id || typeof frog_id !== "string") {
    return NextResponse.json({ error: "frog_id is required" }, { status: 400 });
  }

  // 1. Get the frog from hiring pool
  const { data: poolFrog, error: poolError } = await supabase
    .from("agency_hiring_pool")
    .select("*")
    .eq("id", frog_id)
    .single();

  if (poolError || !poolFrog) {
    return NextResponse.json(
      { error: "Frog not found in hiring pool", details: poolError?.message },
      { status: 404 },
    );
  }

  if (poolFrog.is_hired) {
    return NextResponse.json(
      { error: "This frog has already been hired" },
      { status: 400 },
    );
  }

  // 2. Get current office level and xp
  const { data: office, error: officeError } = await supabase
    .from("agency_office")
    .select("*")
    .limit(1)
    .single();

  if (officeError || !office) {
    return NextResponse.json(
      { error: "Office data not found", details: officeError?.message },
      { status: 500 },
    );
  }

  // 3. Check requirements
  const reasons: string[] = [];

  if (
    poolFrog.required_office_level &&
    office.level < poolFrog.required_office_level
  ) {
    reasons.push(
      `Требуется уровень офиса ${poolFrog.required_office_level}, текущий: ${office.level}`,
    );
  }

  if (poolFrog.required_xp && office.xp < poolFrog.required_xp) {
    reasons.push(
      `Требуется ${poolFrog.required_xp} XP, текущий: ${office.xp}`,
    );
  }

  if (poolFrog.required_mrr && office.mrr < poolFrog.required_mrr) {
    reasons.push(
      `Требуется MRR ${poolFrog.required_mrr}, текущий: ${office.mrr}`,
    );
  }

  if (reasons.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Requirements not met",
        reasons,
        current: {
          level: office.level,
          xp: office.xp,
          mrr: office.mrr,
        },
        required: {
          level: poolFrog.required_office_level,
          xp: poolFrog.required_xp,
          mrr: poolFrog.required_mrr,
        },
      },
      { status: 403 },
    );
  }

  // 4. Copy frog to agency_agents
  const { error: insertError } = await supabase.from("agency_agents").insert({
    id: poolFrog.id,
    name: poolFrog.name,
    avatar_emoji: poolFrog.avatar_emoji,
    role: poolFrog.role,
    department: poolFrog.department,
    personality: poolFrog.personality,
    system_prompt: poolFrog.system_prompt,
    model: poolFrog.model || "claude-sonnet-4-20250514",
    status: "active",
    mood: "excited",
    level: 1,
    xp: 0,
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to hire frog", details: insertError.message },
      { status: 500 },
    );
  }

  // 5. Mark as hired in pool
  await supabase
    .from("agency_hiring_pool")
    .update({ is_hired: true })
    .eq("id", frog_id);

  // 6. Grant XP for hiring
  await supabase
    .from("agency_office")
    .update({ xp: office.xp + 50 })
    .eq("id", office.id);

  return NextResponse.json({
    success: true,
    message: `${poolFrog.avatar_emoji} ${poolFrog.name} присоединился к агентству!`,
    frog: {
      id: poolFrog.id,
      name: poolFrog.name,
      avatar_emoji: poolFrog.avatar_emoji,
      role: poolFrog.role,
      department: poolFrog.department,
    },
  });
}
