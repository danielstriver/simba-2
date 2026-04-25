import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ConvMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  let body: { message: string; catalog: string; history?: ConvMessage[] } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const system = `You are SIMBA, the friendly AI shopping assistant for Simba Supermarket Rwanda.

PRODUCT CATALOG (format: id|name|category|price RWF/unit):
${body.catalog || ""}

RULES:
- Understand and respond in English, French, or Kinyarwanda — always match the user's language
- Be warm, conversational, and concise (2–3 sentences for general chat, more detail for product questions)
- When asked about products, recommend the most relevant ones from the catalog above
- For greetings, thanks, and small talk — respond naturally, no product suggestions needed
- Never invent product IDs not listed in the catalog above
- Simba Supermarket has 11 branches across Kigali: Centenary (Kiyovu), UTC, Kisimenti, Gishushu, Kimironko, Kigali Heights (KG 541 St), Gacuriro, Kicukiro, Gikondo, Sonatube (Silverback Mall), Rebero
- All prices are in Rwandan Francs (RWF). Pickup is free — no delivery
- Use **bold** for product names and prices in your text responses`;

  // Build history starting from first user message
  const raw = (body.history || []).slice(-8);
  const firstUser = raw.findIndex((m) => m.role === "user");
  const messages: ConvMessage[] = [
    ...(firstUser >= 0 ? raw.slice(firstUser) : []),
    { role: "user", content: body.message },
  ];

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system,
      tools: [
        {
          name: "respond_to_customer",
          description: "Send a response to the customer with optional product recommendations from the catalog.",
          input_schema: {
            type: "object" as const,
            properties: {
              text: {
                type: "string",
                description: "The conversational response. Use **bold** for product names and prices.",
              },
              productIds: {
                type: "array",
                items: { type: "integer" },
                description: "Up to 5 product IDs from the catalog that are relevant to the query. Use [] for chitchat, greetings, or non-product questions.",
              },
            },
            required: ["text", "productIds"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "respond_to_customer" },
      messages,
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "No structured response from model" }, { status: 500 });
    }

    const result = toolUse.input as { text: string; productIds: number[] };

    return NextResponse.json({
      text: result.text ?? "Here is what I found for you!",
      productIds: Array.isArray(result.productIds)
        ? result.productIds.filter((x): x is number => typeof x === "number")
        : [],
    });
  } catch (err) {
    console.error("Claude API error:", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
