import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  welcomeEmail,
  orderConfirmationEmail,
  orderPlacedEmail,
  orderReadyEmail,
  passwordResetEmail,
  passwordChangedEmail,
} from "@/lib/emails";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.NOTIFY_FROM_EMAIL ?? "SIMBA Supermarket <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  if (!resend) {
    return NextResponse.json({ ok: false, error: "Email service not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.type || !body?.to) {
    return NextResponse.json({ ok: false, error: "Missing type or to" }, { status: 400 });
  }

  const { type, to: clientTo, data } = body as {
    type: "welcome" | "order_confirmation" | "order_placed" | "order_ready" | "password_reset" | "password_changed";
    to: string;
    data: Record<string, unknown>;
  };

  let subject = "";
  let html = "";
  // order_placed always goes to MANAGER_EMAIL server-side so the client can't redirect it
  let to = type === "order_placed"
    ? (process.env.MANAGER_EMAIL ?? clientTo)
    : clientTo;

  if (type === "welcome") {
    subject = `Welcome to SIMBA Supermarket, ${data.name}!`;
    html = welcomeEmail(data as unknown as Parameters<typeof welcomeEmail>[0]);
  } else if (type === "order_confirmation") {
    subject = `Order ${data.orderId} confirmed — pick up at ${data.branchLabel}`;
    html = orderConfirmationEmail(data as unknown as Parameters<typeof orderConfirmationEmail>[0]);
  } else if (type === "order_placed") {
    subject = `New Order ${data.orderId} — ${data.branchLabel}`;
    html = orderPlacedEmail(data as unknown as Parameters<typeof orderPlacedEmail>[0]);
  } else if (type === "order_ready") {
    subject = `✅ Your SIMBA order ${data.orderId} is ready for pickup!`;
    html = orderReadyEmail(data as unknown as Parameters<typeof orderReadyEmail>[0]);
  } else if (type === "password_reset") {
    subject = `Your SIMBA reset code: ${data.code}`;
    html = passwordResetEmail(data as unknown as Parameters<typeof passwordResetEmail>[0]);
  } else if (type === "password_changed") {
    subject = "Your SIMBA password has been updated";
    html = passwordChangedEmail(data as unknown as Parameters<typeof passwordChangedEmail>[0]);
  } else {
    return NextResponse.json({ ok: false, error: "Unknown notification type" }, { status: 400 });
  }

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify] email send error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
