import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Frog {
  id: string;
  name: string;
  avatar_emoji: string;
  system_prompt: string;
  model: string;
  department: string;
  role: string;
  status: string;
}

interface MeetingResponse {
  frog_id: string;
  frog_name: string;
  avatar: string;
  content: string;
  department: string;
}

async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string,
): Promise<string> {
  if (ANTHROPIC_API_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.content?.[0]?.text || "...";
    }
  }

  if (OPENROUTER_API_KEY) {
    const orModel =
      model.includes("haiku") ? "anthropic/claude-haiku-4-5-20251001" :
      model.includes("opus") ? "anthropic/claude-opus-4-20250514" :
      "anthropic/claude-sonnet-4-20250514";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: orModel,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "...";
    }
  }

  return "Нет доступного API. Добавь ANTHROPIC_API_KEY или OPENROUTER_API_KEY в .env.local";
}

// Determine relevant departments based on topic keywords
function getRelevantDepartments(topic: string): string[] | null {
  const lower = topic.toLowerCase();

  if (lower.includes("edison") || lower.includes("бар") || lower.includes("доставка")) {
    return ["marketing", "operations", "tech"];
  }
  if (lower.includes("myreply") || lower.includes("отзыв")) {
    return ["marketing", "tech"];
  }
  if (lower.includes("маркетинг") || lower.includes("контент")) {
    return ["marketing"];
  }

  // Default: all frogs participate
  return null;
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 500 });
  }

  const body = await request.json();
  const { topic } = body;

  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  // 1. Create a meeting conversation
  const { data: conversation, error: convError } = await supabase
    .from("agency_conversations")
    .insert({
      type: "meeting",
      name: `Встреча: ${topic}`,
      participant_ids: ["architect"],
      project: topic,
    })
    .select()
    .single();

  if (convError || !conversation) {
    return NextResponse.json(
      { error: "Failed to create meeting", details: convError?.message },
      { status: 500 },
    );
  }

  // 2. Load all active frogs
  const { data: allFrogs, error: frogsError } = await supabase
    .from("agency_agents")
    .select("*")
    .eq("status", "active");

  if (frogsError || !allFrogs?.length) {
    return NextResponse.json(
      { error: "No active frogs found", details: frogsError?.message },
      { status: 404 },
    );
  }

  // 3. Select relevant frogs based on topic
  const relevantDepts = getRelevantDepartments(topic);
  let selectedFrogs: Frog[] = allFrogs as Frog[];

  if (relevantDepts) {
    selectedFrogs = allFrogs.filter((f: Frog) =>
      relevantDepts.includes(f.department?.toLowerCase()),
    );
    // Fallback to all if filter yields nothing
    if (selectedFrogs.length === 0) {
      selectedFrogs = allFrogs as Frog[];
    }
  }

  // Update participant_ids on conversation
  const participantIds = ["architect", ...selectedFrogs.map((f) => f.id)];
  await supabase
    .from("agency_conversations")
    .update({ participant_ids: participantIds })
    .eq("id", conversation.id);

  // 4. Load knowledge base
  const { data: kb } = await supabase
    .from("agency_knowledge")
    .select("title, content, category")
    .limit(20);

  const kbContext =
    kb?.map((k) => `[${k.category}] ${k.title}: ${k.content}`).join("\n") || "";

  // 5. Save the topic as the opening "user" message
  await supabase.from("agency_messages").insert({
    conversation_id: conversation.id,
    sender_id: "architect",
    content: `Тема встречи: ${topic}`,
    message_type: "text",
  });

  // 6. Round-robin: each frog responds, seeing all prior messages
  const meetingMessages: ChatMessage[] = [
    { role: "user", content: `Тема встречи: ${topic}` },
  ];

  const responses: MeetingResponse[] = [];

  for (const frog of selectedFrogs) {
    const isLastFrog = frog === selectedFrogs[selectedFrogs.length - 1];

    const meetingSystemPrompt = [
      frog.system_prompt,
      "",
      "--- БАЗА ЗНАНИЙ ---",
      kbContext,
      "",
      "--- КОНТЕКСТ ВСТРЕЧИ ---",
      `Это рабочая встреча агентства Frogface Agency.`,
      `Тема: ${topic}`,
      `Участники: ${selectedFrogs.map((f) => `${f.avatar_emoji} ${f.name} (${f.role})`).join(", ")}`,
      `Ты отвечаешь как ${frog.name} (${frog.role}, отдел: ${frog.department}).`,
      `Дай свой профессиональный взгляд на тему. Будь конкретен, 3-6 предложений.`,
      isLastFrog
        ? `ВАЖНО: Ты последний выступающий. После своего ответа добавь блок "## Итоги встречи" с кратким резюме всех выступлений и списком action items.`
        : "",
    ].join("\n");

    // Set frog status to thinking
    await supabase
      .from("agency_agents")
      .update({ status: "thinking" })
      .eq("id", frog.id);

    const response = await callClaude(
      meetingSystemPrompt,
      meetingMessages,
      frog.model,
    );

    // Save frog message to DB
    await supabase.from("agency_messages").insert({
      conversation_id: conversation.id,
      sender_id: frog.id,
      content: response,
      message_type: "text",
    });

    // Add to running context so next frog sees it
    meetingMessages.push({
      role: "assistant",
      content: `[${frog.name}]: ${response}`,
    });

    // Reset frog status
    await supabase
      .from("agency_agents")
      .update({ status: "active", mood: "focused" })
      .eq("id", frog.id);

    responses.push({
      frog_id: frog.id,
      frog_name: frog.name,
      avatar: frog.avatar_emoji,
      content: response,
      department: frog.department,
    });
  }

  // 7. Save summary artifact from last frog's response (contains "Итоги встречи")
  const lastResponse = responses[responses.length - 1];
  if (lastResponse) {
    const summaryMatch = lastResponse.content.match(
      /## Итоги встречи[\s\S]*/,
    );
    const summaryContent = summaryMatch
      ? summaryMatch[0]
      : `Итоги встречи по теме "${topic}":\n\n${responses.map((r) => `${r.avatar} ${r.frog_name}: ${r.content.slice(0, 200)}...`).join("\n\n")}`;

    await supabase.from("agency_artifacts").insert({
      conversation_id: conversation.id,
      type: "meeting_summary",
      title: `Итоги: ${topic}`,
      content: summaryContent,
      created_by: lastResponse.frog_id,
    });
  }

  return NextResponse.json({
    conversation_id: conversation.id,
    topic,
    participants: selectedFrogs.map((f) => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar_emoji,
      department: f.department,
    })),
    responses,
  });
}
