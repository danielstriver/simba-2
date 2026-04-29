// ─── Shared styles ────────────────────────────────────────────────────────────
const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;

const WRAPPER = `font-family:${FONT};max-width:600px;margin:0 auto;background:#f3f4f6;padding:24px 16px;`;

function card(body: string) {
  return `<div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">${body}</div>`;
}

function header(bg: string, emoji: string, title: string, sub: string) {
  return `<div style="background:${bg};padding:36px 28px;text-align:center;">
    <div style="font-size:40px;line-height:1;margin-bottom:10px;">${emoji}</div>
    <h1 style="color:#fff;margin:0 0 6px;font-size:24px;font-weight:900;letter-spacing:-0.5px;">${title}</h1>
    <p style="color:rgba(255,255,255,.75);margin:0;font-size:13px;">${sub}</p>
  </div>`;
}

function footer() {
  return `<p style="text-align:center;color:#9ca3af;font-size:11px;margin:20px 0 0;line-height:1.8;">
    <strong style="color:#6b7280;">SIMBA Supermarket</strong> · Kigali, Rwanda<br>
    Questions? Visit any of our 11 branches across Kigali.
  </p>`;
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:7px 0;font-size:13px;color:#6b7280;width:120px;">${label}</td>
    <td style="padding:7px 0;font-size:13px;font-weight:700;color:#111827;">${value}</td>
  </tr>`;
}

function badge(text: string, bg: string, color: string) {
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:11px;font-weight:900;padding:4px 10px;border-radius:20px;letter-spacing:.5px;">${text}</span>`;
}

// ─── Welcome Email ─────────────────────────────────────────────────────────────
interface WelcomeData {
  name: string;
  email: string;
}

export function welcomeEmail(data: WelcomeData): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${WRAPPER}">
  ${card(`
    ${header("linear-gradient(135deg,#ea580c,#f97316)", "🦁", `Welcome, ${data.name.split(" ")[0]}!`, "Your SIMBA account is ready")}
    <div style="padding:28px 28px 8px;">
      <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">
        We're thrilled to have you join <strong>SIMBA Supermarket</strong> — Kigali's most popular online supermarket.
        Shop from <strong>789+ products</strong> across 10 categories and pick up your order at any of our <strong>11 branches</strong> across the city.
      </p>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:900;color:#9a3412;text-transform:uppercase;letter-spacing:.5px;">How it works</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 10px 6px 0;vertical-align:top;font-size:22px;width:36px;">🛒</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;"><strong>Browse & add to cart</strong><br><span style="color:#6b7280;">789 products — food, cosmetics, drinks &amp; more</span></td>
          </tr>
          <tr>
            <td style="padding:6px 10px 6px 0;vertical-align:top;font-size:22px;width:36px;">📍</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;"><strong>Choose your branch</strong><br><span style="color:#6b7280;">11 locations across Kigali — Nyarugenge, Gasabo &amp; Kicukiro</span></td>
          </tr>
          <tr>
            <td style="padding:6px 10px 6px 0;vertical-align:top;font-size:22px;width:36px;">💳</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;"><strong>Pay a small deposit</strong><br><span style="color:#6b7280;">Confirms your order. Deducted from total at pickup.</span></td>
          </tr>
          <tr>
            <td style="padding:6px 10px 6px 0;vertical-align:top;font-size:22px;width:36px;">✅</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;"><strong>Pick up &amp; enjoy</strong><br><span style="color:#6b7280;">We'll email you when your order is packed and ready.</span></td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://simba2-daniel.vercel.app/products"
           style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;font-weight:900;font-size:14px;padding:14px 32px;border-radius:50px;box-shadow:0 4px 12px rgba(234,88,12,.3);">
          Start Shopping →
        </a>
      </div>

      <div style="border-top:1px solid #f3f4f6;padding-top:16px;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          Your account email: <strong>${data.email}</strong><br>
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `)}
  ${footer()}
</body></html>`;
}

// ─── Order Confirmation (to customer) ─────────────────────────────────────────
interface OrderConfirmationData {
  orderId: string;
  userName: string;
  userPhone: string;
  branchLabel: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  subtotal: number;
  depositPaid: number;
  amountDueAtPickup: number;
}

export function orderConfirmationEmail(data: OrderConfirmationData): string {
  const rows = data.items.map((i) => `<tr>
    <td style="padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${i.productName}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;">×${i.quantity}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111827;text-align:right;white-space:nowrap;">${(i.price * i.quantity).toLocaleString()} RWF</td>
  </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${WRAPPER}">
  ${card(`
    ${header("linear-gradient(135deg,#ea580c,#f97316)", "📦", "Order Confirmed!", `Order ${data.orderId}`)}
    <div style="padding:28px 28px 8px;">
      <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">
        Hi <strong>${data.userName.split(" ")[0]}</strong>! Your order has been placed and our team at <strong>${data.branchLabel}</strong> will start preparing it shortly.
      </p>

      <!-- Pickup details -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Pickup Details</p>
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow("Order ID", `<span style="font-family:monospace;font-size:14px;color:#ea580c;">${data.orderId}</span>`)}
          ${infoRow("Branch", data.branchLabel)}
          ${infoRow("Date", data.pickupDate)}
          ${infoRow("Time", data.pickupTime)}
          ${infoRow("Phone", data.userPhone)}
        </table>
      </div>

      <!-- Items -->
      <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin:0 0 8px;">Your Items</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        ${rows}
      </table>

      <!-- Totals -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7280;">Items Total</td>
          <td style="padding:6px 0;font-size:13px;font-weight:700;color:#111827;text-align:right;">${data.subtotal.toLocaleString()} RWF</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#16a34a;font-weight:700;">✓ Deposit Paid Online</td>
          <td style="padding:6px 0;font-size:13px;font-weight:700;color:#16a34a;text-align:right;">−${data.depositPaid.toLocaleString()} RWF</td>
        </tr>
      </table>

      <!-- Amount due highlight -->
      <div style="background:#fff7ed;border:2px solid #fb923c;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9a3412;">💰 Amount to Bring at Pickup</p>
        <p style="margin:0;font-size:36px;font-weight:900;color:#ea580c;letter-spacing:-1px;">${data.amountDueAtPickup.toLocaleString()} RWF</p>
        <p style="margin:6px 0 0;font-size:12px;color:#c2410c;">Pay the remaining balance at the <strong>${data.branchLabel}</strong> counter</p>
      </div>

      <!-- What to do next -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:900;color:#166534;">What to do next</p>
        <p style="margin:0 0 6px;font-size:13px;color:#374151;">1. Wait for a <strong>"Ready for Pickup"</strong> email from us</p>
        <p style="margin:0 0 6px;font-size:13px;color:#374151;">2. Head to <strong>${data.branchLabel}</strong> by <strong>${data.pickupDate} at ${data.pickupTime}</strong></p>
        <p style="margin:0;font-size:13px;color:#374151;">3. Show staff your order ID <strong style="font-family:monospace;">${data.orderId}</strong> and pay <strong>${data.amountDueAtPickup.toLocaleString()} RWF</strong></p>
      </div>

      <p style="font-size:12px;color:#9ca3af;margin:0 0 24px;line-height:1.6;">
        Your order will be held for <strong>24 hours</strong> from your pickup time.
        Need to cancel? Visit the <a href="https://simba2-daniel.vercel.app/orders" style="color:#ea580c;">My Orders</a> page.
      </p>
    </div>
  `)}
  ${footer()}
</body></html>`;
}

// ─── Order Placed (to manager/staff) ──────────────────────────────────────────
interface OrderPlacedData {
  orderId: string;
  userName: string;
  userPhone: string;
  branchLabel: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  subtotal: number;
  depositPaid?: number;
}

export function orderPlacedEmail(data: OrderPlacedData): string {
  const rows = data.items.map((i) => `<tr>
    <td style="padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151;">${i.productName}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:center;">×${i.quantity}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111827;text-align:right;white-space:nowrap;">${(i.price * i.quantity).toLocaleString()} RWF</td>
  </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${WRAPPER}">
  ${card(`
    ${header("#ea580c", "📋", "New Order Received", data.branchLabel)}
    <div style="padding:28px 28px 8px;">

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow("Order ID", `<span style="font-family:monospace;color:#ea580c;">${data.orderId}</span>`)}
          ${infoRow("Customer", data.userName)}
          ${infoRow("Phone", data.userPhone)}
          ${infoRow("Pickup", `${data.pickupDate} at ${data.pickupTime}`)}
        </table>
      </div>

      <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin:0 0 8px;">Items to Prepare</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        ${rows}
      </table>

      <table style="width:100%;border-collapse:collapse;border-top:2px solid #f3f4f6;margin-bottom:20px;">
        <tr>
          <td style="padding:12px 0 6px;font-size:14px;font-weight:900;color:#374151;">Order Total</td>
          <td style="padding:12px 0 6px;font-size:24px;font-weight:900;color:#ea580c;text-align:right;">${data.subtotal.toLocaleString()} RWF</td>
        </tr>
        ${data.depositPaid ? `<tr>
          <td style="padding:2px 0 8px;font-size:12px;color:#16a34a;">Deposit already paid online</td>
          <td style="padding:2px 0 8px;font-size:12px;color:#16a34a;text-align:right;">✓ ${data.depositPaid.toLocaleString()} RWF</td>
        </tr>` : ""}
      </table>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;color:#9a3412;"><strong>Action required:</strong> Log in to the staff dashboard to accept and prepare this order.</p>
        <a href="https://simba2-daniel.vercel.app/staff/login"
           style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;font-weight:900;font-size:13px;padding:11px 22px;border-radius:8px;">
          Open Staff Dashboard →
        </a>
      </div>
    </div>
  `)}
  ${footer()}
</body></html>`;
}

// ─── Order Ready (to customer) ─────────────────────────────────────────────────
interface OrderReadyData {
  orderId: string;
  userName?: string;
  branchLabel: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{ productName: string; quantity: number }>;
  amountDue?: number;
}

export function orderReadyEmail(data: OrderReadyData): string {
  const itemList = data.items.map((i) =>
    `<li style="padding:4px 0;font-size:13px;color:#374151;">
      <span style="color:#6b7280;">×${i.quantity}</span> ${i.productName}
    </li>`
  ).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${WRAPPER}">
  ${card(`
    ${header("linear-gradient(135deg,#16a34a,#22c55e)", "✅", "Your Order Is Ready!", `Order ${data.orderId}`)}
    <div style="padding:28px 28px 8px;">
      <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">
        ${data.userName ? `Hi <strong>${data.userName.split(" ")[0]}</strong>! ` : ""}Great news — your order has been packed and is waiting for you at <strong>${data.branchLabel}</strong>. Come collect it today!
      </p>

      <!-- Pickup card -->
      <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:26px;">📍</p>
        <p style="margin:0 0 4px;font-size:16px;font-weight:900;color:#166534;">${data.branchLabel}</p>
        <p style="margin:0;font-size:13px;color:#16a34a;">Pickup by: <strong>${data.pickupDate} at ${data.pickupTime}</strong></p>
        <div style="margin-top:14px;">
          ${badge(`Order ID: ${data.orderId}`, "#dcfce7", "#166534")}
        </div>
      </div>

      ${data.amountDue !== undefined ? `
      <!-- Amount to pay -->
      <div style="background:#fff7ed;border:2px solid #fb923c;border-radius:12px;padding:16px 20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9a3412;">💰 Bring to the Counter</p>
        <p style="margin:0;font-size:36px;font-weight:900;color:#ea580c;letter-spacing:-1px;">${data.amountDue.toLocaleString()} RWF</p>
        <p style="margin:6px 0 0;font-size:12px;color:#c2410c;">Your deposit has already been deducted</p>
      </div>` : ""}

      <!-- Items -->
      <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin:0 0 8px;">Items in Your Order</p>
      <ul style="padding-left:20px;margin:0 0 20px;background:#f9fafb;border-radius:10px;padding:14px 14px 14px 32px;">
        ${itemList}
      </ul>

      <!-- Instructions -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:900;color:#92400e;">What to do</p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;">1. Head to <strong>${data.branchLabel}</strong></p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;">2. Go to the <strong>Online Pickup counter</strong></p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;">3. Show your order ID: <strong style="font-family:monospace;">${data.orderId}</strong></p>
        ${data.amountDue !== undefined ? `<p style="margin:0;font-size:13px;color:#374151;">4. Pay <strong>${data.amountDue.toLocaleString()} RWF</strong> and collect your items 🎉</p>` : ""}
      </div>

      <p style="font-size:12px;color:#9ca3af;margin:0 0 24px;text-align:center;">
        Orders are held for <strong>24 hours</strong> from your scheduled pickup time.
      </p>
    </div>
  `)}
  ${footer()}
</body></html>`;
}

// ─── Password Reset ────────────────────────────────────────────────────────────
interface PasswordResetData {
  code: string;
}

export function passwordResetEmail(data: PasswordResetData): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${WRAPPER}">
  ${card(`
    ${header("#ea580c", "🔐", "Password Reset", "SIMBA Supermarket")}
    <div style="padding:32px 28px;text-align:center;">
      <p style="font-size:15px;color:#374151;margin:0 0 24px;line-height:1.6;">
        You requested a password reset for your SIMBA account. Use the code below to continue.
      </p>
      <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:14px;padding:30px 24px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;font-weight:700;">Your Reset Code</p>
        <p style="margin:0;font-size:52px;font-weight:900;letter-spacing:12px;color:#ea580c;font-family:monospace;">${data.code}</p>
        <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">Expires in <strong>10 minutes</strong></p>
      </div>
      <p style="font-size:12px;color:#9ca3af;margin:0;">If you didn't request this, ignore this email — your account is safe.</p>
    </div>
  `)}
  ${footer()}
</body></html>`;
}

// ─── Password Changed ──────────────────────────────────────────────────────────
interface PasswordChangedData {
  email: string;
}

export function passwordChangedEmail(data: PasswordChangedData): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${WRAPPER}">
  ${card(`
    ${header("#16a34a", "🔒", "Password Updated", "SIMBA Supermarket")}
    <div style="padding:32px 28px;text-align:center;">
      <p style="font-size:15px;color:#374151;margin:0 0 20px;line-height:1.6;">
        Your SIMBA account password has been successfully updated.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin:0 0 20px;text-align:left;">
        <p style="margin:0 0 4px;font-size:13px;color:#166534;font-weight:900;">✓ Password changed successfully</p>
        <p style="margin:0;font-size:12px;color:#4b7c5e;">Account: ${data.email}</p>
      </div>
      <p style="font-size:13px;color:#6b7280;margin:0;">
        If you didn't make this change, contact us at your nearest SIMBA branch immediately.
      </p>
    </div>
  `)}
  ${footer()}
</body></html>`;
}
