interface OrderPlacedData {
  orderId: string;
  userName: string;
  userPhone: string;
  branchLabel: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  subtotal: number;
}

interface OrderReadyData {
  orderId: string;
  branchLabel: string;
  pickupDate: string;
  pickupTime: string;
  items: Array<{ productName: string; quantity: number }>;
}

interface PasswordResetData {
  code: string;
}

const BASE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 20px;
  color: #1f2937;
  background: #f9fafb;
`;

export function orderPlacedEmail(data: OrderPlacedData): string {
  const rows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:14px;">${i.productName}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:center;">×${i.quantity}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:14px;text-align:right;font-weight:bold;">${(i.price * i.quantity).toLocaleString()} RWF</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><body style="${BASE}">
    <div style="background:#ea580c;padding:28px 24px;border-radius:14px 14px 0 0;text-align:center;">
      <div style="font-size:32px;margin-bottom:6px;">📦</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">New Order Received</h1>
      <p style="color:#fed7aa;margin:4px 0 0;font-size:13px;">${data.branchLabel}</p>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 14px 14px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7280;">Order ID</td>
          <td style="padding:6px 0;font-size:13px;font-weight:900;font-family:monospace;color:#1f2937;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7280;">Customer</td>
          <td style="padding:6px 0;font-size:13px;font-weight:700;color:#1f2937;">${data.userName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7280;">Phone</td>
          <td style="padding:6px 0;font-size:13px;font-weight:700;color:#1f2937;">${data.userPhone}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7280;">Pickup</td>
          <td style="padding:6px 0;font-size:13px;font-weight:700;color:#1f2937;">${data.pickupDate} at ${data.pickupTime}</td>
        </tr>
      </table>

      <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:6px;">Items</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        ${rows}
      </table>

      <table style="width:100%;border-collapse:collapse;border-top:2px solid #f3f4f6;margin-bottom:8px;">
        <tr>
          <td style="padding:14px 0 10px;font-size:14px;font-weight:900;color:#374151;">Order Total</td>
          <td style="padding:14px 0 10px;font-size:22px;font-weight:900;color:#ea580c;text-align:right;white-space:nowrap;">${data.subtotal.toLocaleString()} RWF</td>
        </tr>
      </table>

      <div style="background:#fff7ed;border:1px solid #fed7aa;padding:16px;border-radius:10px;margin-top:4px;">
        <p style="margin:0 0 12px;font-size:13px;color:#9a3412;">
          <strong>Action required:</strong> Log in to the SIMBA staff dashboard to accept and prepare this order.
        </p>
        <a href="https://simba2-daniel.vercel.app/staff/login"
           style="display:inline-block;background:#ea580c;color:white;text-decoration:none;font-weight:900;font-size:13px;padding:10px 20px;border-radius:8px;">
          Open Staff Dashboard &rarr;
        </a>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">
      SIMBA Supermarket · Kigali, Rwanda
    </p>
  </body></html>`;
}

export function orderReadyEmail(data: OrderReadyData): string {
  const itemList = data.items
    .map((i) => `<li style="padding:3px 0;font-size:14px;color:#374151;">${i.productName} <span style="color:#9ca3af;">×${i.quantity}</span></li>`)
    .join("");

  return `<!DOCTYPE html><html><body style="${BASE}">
    <div style="background:#16a34a;padding:28px 24px;border-radius:14px 14px 0 0;text-align:center;">
      <div style="font-size:32px;margin-bottom:6px;">✅</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Your Order Is Ready!</h1>
      <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px;">Order ${data.orderId}</p>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 14px 14px;">
      <p style="font-size:15px;color:#374151;margin-top:0;">
        Great news! Your SIMBA Supermarket order has been packed and is ready for you to collect in store.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:10px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#166534;">
          <strong>📍 Pick up at:</strong> ${data.branchLabel}
        </p>
        <p style="margin:0;font-size:14px;color:#166534;">
          <strong>🕐 Pickup by:</strong> ${data.pickupDate} at ${data.pickupTime}
        </p>
      </div>

      <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:8px;">Your items</p>
      <ul style="padding-left:20px;margin:0 0 20px;">
        ${itemList}
      </ul>

      <div style="background:#fffbeb;border:1px solid #fde68a;padding:14px 16px;border-radius:10px;">
        <p style="margin:0;font-size:13px;color:#92400e;">
          💡 Head to <strong>${data.branchLabel}</strong> and show our staff your order ID <strong>${data.orderId}</strong>. Your order will be held for 24 hours.
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">
      SIMBA Supermarket · Kigali, Rwanda
    </p>
  </body></html>`;
}

interface PasswordChangedData {
  email: string;
}

export function passwordChangedEmail(data: PasswordChangedData): string {
  return `<!DOCTYPE html><html><body style="${BASE}">
    <div style="background:#16a34a;padding:28px 24px;border-radius:14px 14px 0 0;text-align:center;">
      <div style="font-size:32px;margin-bottom:6px;">🔒</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Password Updated</h1>
      <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px;">SIMBA Supermarket</p>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:32px 24px;border-radius:0 0 14px 14px;text-align:center;">
      <p style="font-size:15px;color:#374151;margin-top:0;">
        Your SIMBA account password has been successfully updated.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px 20px;border-radius:10px;margin:20px 0;text-align:left;">
        <p style="margin:0 0 4px;font-size:13px;color:#166534;font-weight:900;">&#10003; Password changed</p>
        <p style="margin:0;font-size:12px;color:#4b7c5e;">Account: ${data.email}</p>
      </div>
      <p style="font-size:13px;color:#6b7280;">
        If you did not make this change, please contact us at your nearest SIMBA branch immediately.
      </p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">
      SIMBA Supermarket · Kigali, Rwanda
    </p>
  </body></html>`;
}

export function passwordResetEmail(data: PasswordResetData): string {
  return `<!DOCTYPE html><html><body style="${BASE}">
    <div style="background:#ea580c;padding:28px 24px;border-radius:14px 14px 0 0;text-align:center;">
      <div style="font-size:32px;margin-bottom:6px;">🔐</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Password Reset</h1>
      <p style="color:#fed7aa;margin:4px 0 0;font-size:13px;">SIMBA Supermarket</p>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:32px 24px;border-radius:0 0 14px 14px;text-align:center;">
      <p style="font-size:15px;color:#374151;margin-top:0;">
        You requested a password reset for your SIMBA account. Use this code to continue:
      </p>

      <div style="background:#f9fafb;border:2px dashed #e5e7eb;padding:28px 24px;border-radius:12px;margin:24px 0;">
        <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;">Your Reset Code</p>
        <p style="margin:0;font-size:52px;font-weight:900;letter-spacing:10px;color:#ea580c;font-family:monospace;">${data.code}</p>
      </div>

      <p style="font-size:13px;color:#6b7280;margin-bottom:4px;">This code expires in <strong>10 minutes</strong>.</p>
      <p style="font-size:13px;color:#9ca3af;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;">
      SIMBA Supermarket · Kigali, Rwanda
    </p>
  </body></html>`;
}
