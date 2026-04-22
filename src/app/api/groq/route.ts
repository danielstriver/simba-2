import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 503 });
  }

  let body: { message: string; catalog: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.message || !body?.catalog) {
    return NextResponse.json({ error: "Missing message or catalog" }, { status: 400 });
  }

  const system = `You are SIMBA, the friendly AI shopping assistant for Simba Supermarket Rwanda.

PRODUCT CATALOG (format: id|name|category|price RWF/unit):
${body.catalog}

RULES:
- Understand queries in English, French, or Kinyarwanda
- Respond in the same language as the user
- Be helpful, friendly, and concise (2-3 sentences max)
- When the user asks about products, find the most relevant ones from the catalog above
- You MUST respond with valid JSON in this exact format:
{"text":"your response here","productIds":[array of up to 5 numeric product IDs]}
- productIds must be integers that exist in the catalog, or empty [] if no match
- Never invent product IDs not listed above
- Pickup info: Simba has 9 branches in Kigali (Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga) and Nyanza`;

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: system },
          { role: "user", content: body.message },
        ],
        temperature: 0.4,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Groq API error:", resp.status, errText);
      return NextResponse.json({ error: "Groq API error" }, { status: 502 });
    }

    const data = await resp.json() as { choices: Array<{ message: { content: string } }> };
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { text?: string; productIds?: unknown[] };

    return NextResponse.json({
      text: parsed.text ?? "Here is what I found for you!",
      productIds: Array.isArray(parsed.productIds)
        ? parsed.productIds.filter((x): x is number => typeof x === "number")
        : [],
    });
  } catch (err) {
    console.error("Groq request failed:", err);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
