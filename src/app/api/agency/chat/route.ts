import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  model: string,
): Promise<string> {
  // Try Anthropic API first, fallback to OpenRouter
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

  // Fallback: OpenRouter
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

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: "No Supabase" }, { status: 500 });

  const body = await request.json();
  const { conversation_id, message, target_frog_id } = body;

  if (!conversation_id || !message) {
    return NextResponse.json({ error: "conversation_id and message required" }, { status: 400 });
  }

  // Save user message
  await supabase.from("agency_messages").insert({
    conversation_id,
    sender_id: "architect",
    content: message,
    message_type: "text",
  });

  // Get conversation info
  const { data: conv } = await supabase
    .from("agency_conversations")
    .select("*")
    .eq("id", conversation_id)
    .single();

  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  // Determine which frogs should respond
  let respondingFrogIds: string[] = [];

  if (target_frog_id) {
    respondingFrogIds = [target_frog_id];
  } else if (conv.type === "dm") {
    respondingFrogIds = conv.participant_ids.filter((id: string) => id !== "architect");
  } else {
    // Channel: check if message mentions a frog with @
    const mentionMatch = message.match(/@(\w+)/);
    if (mentionMatch) {
      respondingFrogIds = [mentionMatch[1]];
    } else {
      // All frog participants respond (except architect)
      respondingFrogIds = conv.participant_ids.filter((id: string) => id !== "architect");
      // In channels, only 1-2 most relevant frogs respond to avoid spam
      respondingFrogIds = respondingFrogIds.slice(0, 2);
    }
  }

  // Get frog data
  const { data: frogs } = await supabase
    .from("agency_agents")
    .select("*")
    .in("id", respondingFrogIds);

  if (!frogs?.length) return NextResponse.json({ error: "No frogs found" }, { status: 404 });

  // Get recent conversation history
  const { data: history } = await supabase
    .from("agency_messages")
    .select("sender_id, content")
    .eq("conversation_id", conversation_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const chatHistory: ChatMessage[] = (history || []).reverse().map((m) => ({
    role: m.sender_id === "architect" ? "user" as const : "assistant" as const,
    content: m.sender_id === "architect" ? m.content : `[${m.sender_id}]: ${m.content}`,
  }));

  // Get knowledge base context
  const { data: kb } = await supabase
    .from("agency_knowledge")
    .select("title, content, category")
    .limit(10);

  const kbContext = kb?.map((k) => `[${k.category}] ${k.title}: ${k.content}`).join("\n") || "";

  // Each frog responds
  const responses: { frog_id: string; frog_name: string; content: string; avatar: string }[] = [];

  for (const frog of frogs) {
    const enrichedPrompt = `${frog.system_prompt}\n\n--- БАЗА ЗНАНИЙ ---\n${kbContext}\n\n--- КОНТЕКСТ ---\nКанал: ${conv.name || "DM"}\nПроект: ${conv.project || "общий"}\nОтвечай кратко (2-5 предложений) если это чат. Развёрнуто только если просят.`;

    // Update frog status
    await supabase.from("agency_agents").update({ status: "thinking" }).eq("id", frog.id);

    const response = await callClaude(enrichedPrompt, chatHistory, frog.model);

    // Save frog response
    await supabase.from("agency_messages").insert({
      conversation_id,
      sender_id: frog.id,
      content: response,
      message_type: "text",
    });

    // Update frog status back
    await supabase.from("agency_agents").update({ status: "active", mood: "focused" }).eq("id", frog.id);

    responses.push({
      frog_id: frog.id,
      frog_name: frog.name,
      content: response,
      avatar: frog.avatar_emoji,
    });
  }

  return NextResponse.json({ responses });
}
