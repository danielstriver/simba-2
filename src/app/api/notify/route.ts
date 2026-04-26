import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { orderPlacedEmail, orderReadyEmail, passwordResetEmail, passwordChangedEmail } from "@/lib/emails";

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
    type: "order_placed" | "order_ready" | "password_reset" | "password_changed";
    to: string;
    data: Record<string, unknown>;
  };

  let subject = "";
  let html = "";
  // For order_placed: always use the server-side MANAGER_EMAIL env var if set,
  // so delivery is never dependent on the client's localStorage state.
  let to = type === "order_placed"
    ? (process.env.MANAGER_EMAIL ?? clientTo)
    : clientTo;

  if (type === "order_placed") {
    subject = `New Order ${data.orderId} — ${data.branchLabel}`;
    html = orderPlacedEmail(data as unknown as Parameters<typeof orderPlacedEmail>[0]);
  } else if (type === "order_ready") {
    subject = `Your SIMBA order ${data.orderId} is ready for pickup!`;
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
