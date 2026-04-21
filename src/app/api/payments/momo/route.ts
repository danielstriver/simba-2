import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const BASE_URL = process.env.MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com";
const SUBSCRIPTION_KEY = process.env.MOMO_SUBSCRIPTION_KEY ?? "";
const API_USER = process.env.MOMO_API_USER ?? "";
const API_KEY = process.env.MOMO_API_KEY ?? "";
const ENVIRONMENT = process.env.MOMO_ENVIRONMENT ?? "sandbox";
const CURRENCY = ENVIRONMENT === "sandbox" ? "EUR" : "RWF";

async function getBearerToken(): Promise<string> {
  const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString("base64");
  const res = await fetch(`${BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

// POST — initiate Request to Pay (sends USSD push to user's phone)
export async function POST(req: NextRequest) {
  try {
    const { phone, amount, orderId } = await req.json() as { phone: string; amount: number; orderId: string };

    if (!phone || !amount || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!SUBSCRIPTION_KEY || !API_USER || !API_KEY) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const token = await getBearerToken();
    const referenceId = randomUUID();

    // Clean phone number — strip spaces, dashes, leading +
    const msisdn = phone.replace(/[\s\-+]/g, "");

    const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": ENVIRONMENT,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(Math.round(amount)),
        currency: CURRENCY,
        externalId: orderId,
        payer: { partyIdType: "MSISDN", partyId: msisdn },
        payerMessage: "Simba Supermarket payment",
        payeeNote: `Order ${orderId}`,
      }),
    });

    if (res.status !== 202) {
      const body = await res.text();
      return NextResponse.json({ error: `MTN error: ${res.status}`, detail: body }, { status: 502 });
    }

    return NextResponse.json({ referenceId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — poll payment status
export async function GET(req: NextRequest) {
  const referenceId = req.nextUrl.searchParams.get("id");
  if (!referenceId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const token = await getBearerToken();
    const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
        "X-Target-Environment": ENVIRONMENT,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Status check failed: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ status: data.status as string });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
