import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, size, note, product, price } = body;

    // Pre-built email types (confirmation, shipping, blast) — forward directly
    if (body.type && ['confirmation','shipping','blast'].includes(body.type) && body.to && body.subject && body.body) {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (!RESEND_API_KEY) return new Response(JSON.stringify({ error: 'Email not configured' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'The Illest Supply <onboarding@resend.dev>',
          to: [body.to],
          subject: body.subject,
          html: body.body,
        }),
      });
      if (!res.ok) { const err = await res.text(); return new Response(JSON.stringify({ error: 'Send failed', detail: err }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }); }
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    if (!name || !email || !product) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Send email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const emailBody = `
<!DOCTYPE html>
<html>
<body style="background:#080808;color:#fff;font-family:'Inter',sans-serif;padding:40px 20px;margin:0;">
  <div style="max-width:500px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
    <div style="background:#fff;color:#000;padding:16px 24px;text-align:center;">
      <strong style="font-size:13px;letter-spacing:3px;text-transform:uppercase;">🔥 New Inquiry — Illest Supply</strong>
    </div>
    <div style="padding:28px 28px 24px;">
      <p style="font-size:11px;letter-spacing:2px;color:#555;text-transform:uppercase;margin-bottom:6px;">Product</p>
      <p style="font-weight:800;font-size:1.1rem;text-transform:uppercase;margin-bottom:4px;">${product}</p>
      <p style="color:#e5e5e5;font-weight:700;font-size:1.2rem;margin-bottom:28px;">$${price}</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;width:100px;">Name</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;font-weight:600;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;font-weight:600;"><a href="mailto:${email}" style="color:#aaa;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Size</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;font-weight:600;">${size || '—'}</td>
        </tr>
        ${note ? `
        <tr>
          <td style="padding:10px 0;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;vertical-align:top;">Message</td>
          <td style="padding:10px 0;font-size:14px;color:#aaa;line-height:1.6;">${note}</td>
        </tr>
        ` : ''}
      </table>

      <div style="margin-top:28px;padding:14px 18px;background:rgba(255,255,255,0.04);border-radius:10px;font-size:12px;color:#555;text-align:center;">
        Reply to this email or DM them on Instagram to close the sale 🔥
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Illest Supply <onboarding@resend.dev>',
        to: ['timoy@scaleflowz.us'],
        reply_to: email,
        subject: `🔥 New Inquiry: ${product} — $${price}`,
        html: emailBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
