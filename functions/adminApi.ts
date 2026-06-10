import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const client = createClientFromRequest(req, { appId: "6a21ea02495f72afbc2ec54c" });
  const db = client.asServiceRole.entities;

  try {
    // ── AUTH ──────────────────────────────────────────────────────────────
    if (action === "login") {
      const { passcode } = await req.json();
      const users = await db.AdminUser.list();
      const user = users.find((u: any) => u.passcode === passcode && u.active);
      if (!user) return Response.json({ error: "Invalid passcode" }, { status: 401, headers: cors });
      return Response.json({ success: true, user: { id: user.id, name: user.name, role: user.role, passcode: user.passcode } }, { headers: cors });
    }

    // ── INQUIRIES ─────────────────────────────────────────────────────────
    if (action === "getInquiries") {
      const items = await db.Inquiry.list();
      items.sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
      return Response.json(items, { headers: cors });
    }
    if (action === "updateInquiry") {
      const { id, ...data } = await req.json();
      await db.Inquiry.update(id, data);
      return Response.json({ success: true }, { headers: cors });
    }
    if (action === "createInquiry") {
      const data = await req.json();
      const inquiry = await db.Inquiry.create({ ...data, status: "New" });
      const customers = await db.Customer.list();
      const existing = customers.find((c: any) => c.email?.toLowerCase() === data.customer_email?.toLowerCase());
      if (existing) {
        await db.Customer.update(existing.id, {
          total_orders: (existing.total_orders || 0) + 1,
          total_spent: (existing.total_spent || 0) + (data.price || 0),
          last_inquiry_date: new Date().toISOString().split("T")[0],
          tags: (existing.total_orders || 0) >= 2 ? "Repeat Buyer" : existing.tags,
        });
      } else {
        await db.Customer.create({
          name: data.customer_name, email: data.customer_email,
          total_orders: 1, total_spent: data.price || 0,
          last_inquiry_date: new Date().toISOString().split("T")[0], tags: "New",
        });
      }
      return Response.json({ success: true, id: inquiry.id }, { headers: cors });
    }

    // ── INVENTORY ─────────────────────────────────────────────────────────
    if (action === "getInventory") {
      const items = await db.InventoryItem.list();
      return Response.json(items, { headers: cors });
    }
    if (action === "updateInventory") {
      const { id, in_stock, quantity } = await req.json();
      await db.InventoryItem.update(id, { in_stock, quantity });
      return Response.json({ success: true }, { headers: cors });
    }

    // ── PRODUCT OVERRIDES ─────────────────────────────────────────────────
    if (action === "getProductOverrides") {
      const overrides = await db.ProductOverride.list();
      return Response.json(overrides, { headers: cors });
    }
    if (action === "upsertProductOverride") {
      const data = await req.json();
      const overrides = await db.ProductOverride.list();
      const existing = overrides.find((o: any) => o.product_id === data.product_id);
      if (existing) {
        await db.ProductOverride.update(existing.id, data);
        return Response.json({ success: true, id: existing.id }, { headers: cors });
      } else {
        const created = await db.ProductOverride.create(data);
        return Response.json({ success: true, id: created.id }, { headers: cors });
      }
    }

    // ── PRODUCT FULL CRUD ─────────────────────────────────────────────────
    // Create a full product (custom, id >= 100)
    if (action === "createProduct") {
      const data = await req.json();
      // Assign next available product_id >= 100
      const overrides = await db.ProductOverride.list();
      const customIds = overrides.filter((o: any) => o.product_id >= 100).map((o: any) => o.product_id);
      const nextId = customIds.length > 0 ? Math.max(...customIds) + 1 : 100;
      const productData = {
        product_id: nextId,
        product_name: data.product_name || '',
        price: parseFloat(data.price) || 0,
        orig_price: parseFloat(data.orig_price) || 0,
        is_sold_out: data.status === 'soldout',
        is_hidden: data.status === 'draft',
        is_new_arrival: data.is_new_arrival || false,
        is_best_seller: data.is_best_seller || false,
        badges: data.badges || '',
        sold_count: parseInt(data.sold_count) || 0,
        brand: data.brand || '',
        category: data.category || 'sneakers',
        condition: data.condition || 'Brand New',
        desc: data.desc || '',
        sizes: data.sizes || '',
        img: data.img || '',
        imgs: data.imgs || '',
        video: data.video || '',
        // Extra fields stored in desc as JSON supplement
      };
      const created = await db.ProductOverride.create(productData);
      return Response.json({ success: true, id: created.id, product_id: nextId }, { headers: cors });
    }

    // Update a product by DB record id
    if (action === "updateProduct") {
      const { id, ...data } = await req.json();
      const updateData: any = {};
      if (data.product_name !== undefined) updateData.product_name = data.product_name;
      if (data.price !== undefined) updateData.price = parseFloat(data.price) || 0;
      if (data.orig_price !== undefined) updateData.orig_price = parseFloat(data.orig_price) || 0;
      if (data.status !== undefined) {
        updateData.is_sold_out = data.status === 'soldout';
        updateData.is_hidden = data.status === 'draft';
      }
      if (data.is_new_arrival !== undefined) updateData.is_new_arrival = data.is_new_arrival;
      if (data.is_best_seller !== undefined) updateData.is_best_seller = data.is_best_seller;
      if (data.badges !== undefined) updateData.badges = data.badges;
      if (data.sold_count !== undefined) updateData.sold_count = parseInt(data.sold_count) || 0;
      if (data.brand !== undefined) updateData.brand = data.brand;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.condition !== undefined) updateData.condition = data.condition;
      if (data.desc !== undefined) updateData.desc = data.desc;
      if (data.sizes !== undefined) updateData.sizes = data.sizes;
      if (data.img !== undefined) updateData.img = data.img;
      if (data.imgs !== undefined) updateData.imgs = data.imgs;
      if (data.video !== undefined) updateData.video = data.video;
      await db.ProductOverride.update(id, updateData);
      return Response.json({ success: true }, { headers: cors });
    }

    // Delete a product
    // Custom products (id >= 100): fully delete the record
    // Static products (id < 100): mark is_hidden=true so storefront filters them out
    // If no record id is provided but product_id is, find or create the override first
    if (action === "deleteProduct") {
      const body = await req.json();
      let { id, product_id } = body;
      let record: any = null;
      if (id) {
        record = await db.ProductOverride.get(id);
      } else if (product_id != null) {
        // Find override by product_id
        const allOverrides = await db.ProductOverride.list();
        record = allOverrides.find((o: any) => o.product_id === product_id) || null;
        if (!record) {
          // No override exists yet — create one that hides it
          await db.ProductOverride.create({ product_id, is_hidden: true });
          return Response.json({ success: true }, { headers: cors });
        }
        id = record.id;
      }
      if (!record) return Response.json({ error: "Not found" }, { status: 404, headers: cors });
      const pid = record.product_id;
      if (pid >= 100) {
        // Custom product — fully remove
        await db.ProductOverride.delete(id);
      } else {
        // Static product — hide it so it disappears from storefront
        await db.ProductOverride.update(id, { is_hidden: true });
      }
      return Response.json({ success: true }, { headers: cors });
    }

    // Duplicate a product
    if (action === "duplicateProduct") {
      const { id } = await req.json();
      const overrides = await db.ProductOverride.list();
      const source = overrides.find((o: any) => o.id === id);
      if (!source) return Response.json({ error: "Not found" }, { status: 404, headers: cors });
      const customIds = overrides.filter((o: any) => o.product_id >= 100).map((o: any) => o.product_id);
      const nextId = customIds.length > 0 ? Math.max(...customIds) + 1 : 100;
      const { id: _id, created_date, updated_date, created_by, created_by_id, ...rest } = source;
      const created = await db.ProductOverride.create({ ...rest, product_id: nextId, product_name: rest.product_name + ' (Copy)', is_hidden: true });
      return Response.json({ success: true, id: created.id, product_id: nextId }, { headers: cors });
    }

    // ── MEDIA UPLOAD ──────────────────────────────────────────────────────
    if (action === "uploadMedia") {
      try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400, headers: cors });

        // Detect type by extension as fallback (some browsers send blank MIME for MP4)
        const nm = file.name.toLowerCase();
        const extMime: Record<string,string> = {
          jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', mp4:'video/mp4'
        };
        const ext = nm.split('.').pop() || '';
        const detectedType = (file.type && file.type !== 'application/octet-stream')
          ? file.type : (extMime[ext] || file.type);

        const allowedTypes = ['image/jpeg','image/jpg','image/png','image/webp','video/mp4'];
        if (!allowedTypes.includes(detectedType)) {
          return new Response(JSON.stringify({ error: "Please upload an MP4 video file." }), { status: 400, headers: cors });
        }

        const isVideo = detectedType.startsWith('video/');
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          return new Response(JSON.stringify({ error: `File too large. Max ${isVideo ? '50MB for videos' : '10MB for images'}.` }), { status: 400, headers: cors });
        }

        // Convert to base64 — use a chunk approach safe for large files in Deno
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        // Deno-safe base64 via native encode
        const base64 = btoa(
          uint8.reduce((acc, byte) => acc + String.fromCharCode(byte), "")
        );

        const fname = `product_${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext || 'bin'}`;
        const uploadRes = await fetch(`https://api.base44.com/api/apps/6a21ea02495f72afbc2ec54c/storage/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": Deno.env.get("BASE44_API_KEY") || "" },
          body: JSON.stringify({ filename: fname, content_base64: base64, content_type: detectedType, public: true })
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          return new Response(JSON.stringify({ url: uploadData.url, type: isVideo ? 'video' : 'image' }), { headers: cors });
        }
        return new Response(JSON.stringify({ error: "Upload failed — storage error.", detail: uploadData }), { status: 500, headers: cors });
      } catch(e) {
        return new Response(JSON.stringify({ error: "Upload error: " + String(e) }), { status: 500, headers: cors });
      }
    }

    // ── CUSTOMERS ─────────────────────────────────────────────────────────
    if (action === "getCustomers") {
      const items = await db.Customer.list();
      items.sort((a: any, b: any) => (b.total_orders || 0) - (a.total_orders || 0));
      return Response.json(items, { headers: cors });
    }
    if (action === "updateCustomer") {
      const { id, ...data } = await req.json();
      await db.Customer.update(id, data);
      return Response.json({ success: true }, { headers: cors });
    }

    // ── ANALYTICS ─────────────────────────────────────────────────────────
    if (action === "getAnalytics") {
      const inquiries = await db.Inquiry.list();
      const customers = await db.Customer.list();
      const inventory = await db.InventoryItem.list();
      const byStatus: any = {};
      const byProduct: any = {};
      let revenue = 0;
      inquiries.forEach((i: any) => {
        byStatus[i.status] = (byStatus[i.status] || 0) + 1;
        byProduct[i.product_name] = (byProduct[i.product_name] || 0) + 1;
        if (["Paid", "Shipped", "Done"].includes(i.status)) revenue += i.price || 0;
      });
      const topProducts = Object.entries(byProduct).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
      const now = Date.now();
      const trend = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now - (6 - i) * 86400000);
        const label = day.toLocaleDateString("en-US", { weekday: "short" });
        const count = inquiries.filter((inq: any) => new Date(inq.created_date).toDateString() === day.toDateString()).length;
        return { label, count };
      });
      const topCustomers = [...customers].sort((a: any, b: any) => (b.total_spent || 0) - (a.total_spent || 0)).slice(0, 5)
        .map((c: any) => ({ name: c.name, email: c.email, total_orders: c.total_orders || 0, total_spent: c.total_spent || 0 }));
      return Response.json({
        total_inquiries: inquiries.length, by_status: byStatus, top_products: topProducts, top_customers: topCustomers,
        estimated_revenue: revenue, total_customers: customers.length,
        repeat_buyers: customers.filter((c: any) => (c.total_orders || 0) >= 2).length,
        oos_sizes: inventory.filter((i: any) => !i.in_stock).length, trend,
      }, { headers: cors });
    }

    // ── DROPS ─────────────────────────────────────────────────────────────
    if (action === "getDrops") {
      return Response.json(await db.ScheduledDrop.list(), { headers: cors });
    }
    if (action === "createDrop") {
      const data = await req.json();
      const drop = await db.ScheduledDrop.create({ ...data, is_live: false });
      return Response.json({ success: true, id: drop.id }, { headers: cors });
    }
    if (action === "updateDrop") {
      const { id, ...data } = await req.json();
      await db.ScheduledDrop.update(id, data);
      return Response.json({ success: true }, { headers: cors });
    }
    if (action === "deleteDrop") {
      const { id } = await req.json();
      await db.ScheduledDrop.delete(id);
      return Response.json({ success: true }, { headers: cors });
    }

    // ── EMAIL BLAST ───────────────────────────────────────────────────────
    if (action === "emailBlast") {
      const { subject, body, emails } = await req.json();
      const sendResults = await Promise.allSettled(emails.map((email: string) =>
        fetch("https://superagent-bc2ec54c.base44.app/functions/sendInquiry", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, subject, body, type: "blast" })
        })
      ));
      const sent = sendResults.filter(r => r.status === "fulfilled").length;
      return Response.json({ success: true, sent }, { headers: cors });
    }

    // ── ADMIN USERS ───────────────────────────────────────────────────────
    if (action === "getAdminUsers") {
      const users = await db.AdminUser.list();
      return Response.json(users.map((u: any) => ({ id: u.id, name: u.name, role: u.role, email: u.email, active: u.active, passcode: u.passcode })), { headers: cors });
    }
    if (action === "updateAdminUser") {
      const { id, ...data } = await req.json();
      await db.AdminUser.update(id, data);
      return Response.json({ success: true }, { headers: cors });
    }
    if (action === "createAdminUser") {
      const data = await req.json();
      await db.AdminUser.create({ ...data, active: true });
      return Response.json({ success: true }, { headers: cors });
    }

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────
    if (action === "notifyDrop") {
      const { product_name, email } = await req.json();
      const drops = await db.ScheduledDrop.list();
      const drop = drops.find((d: any) => d.product_name === product_name);
      if (drop) {
        const existing = drop.notify_list ? drop.notify_list.split(',').filter(Boolean) : [];
        if (!existing.includes(email)) { existing.push(email); await db.ScheduledDrop.update(drop.id, { notify_list: existing.join(',') }); }
      }
      return Response.json({ success: true }, { headers: cors });
    }
    if (action === "notifyOos") {
      const { product_name, size, email } = await req.json();
      const items = await db.InventoryItem.list();
      const item = items.find((i: any) => i.product_name === product_name && i.size === size);
      if (item) {
        const existing = item.notes ? item.notes.split(',').filter(Boolean) : [];
        if (!existing.includes(email)) { existing.push(email); await db.InventoryItem.update(item.id, { notes: 'notify:' + existing.join(',') }); }
      }
      return Response.json({ success: true }, { headers: cors });
    }

    // ── ORDER CONFIRMATION EMAIL ───────────────────────────────────────────
    if (action === "sendOrderConfirmationEmail") {
      const { customer_name, customer_email, order_number, items, subtotal, shipping, tax, total, address } = await req.json();
      if (!customer_email) return Response.json({ error: "Missing email" }, { status: 400, headers: cors });
      const itemsHtml = (items || []).map((item: any) => `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);">
          ${item.img ? `<img src="${item.img}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;" alt="${item.name}">` : ''}
          <div style="flex:1;"><div style="color:#fff;font-size:14px;font-weight:700;">${item.name}</div>${item.size ? `<div style="color:#555;font-size:12px;margin-top:2px;">Size: ${item.size}</div>` : ''}<div style="color:#555;font-size:12px;">Qty: ${item.qty || 1}</div></div>
          <div style="color:#fff;font-size:14px;font-weight:800;">$${((item.price||0)*(item.qty||1)).toFixed(2)}</div>
        </div>`).join('');
      const addrHtml = address ? `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} ${address.zip}` : '—';
      const emailHtml = `<div style="background:#080808;padding:40px 20px;font-family:'Inter',sans-serif;"><div style="max-width:520px;margin:0 auto;"><div style="text-align:center;margin-bottom:28px;"><img src="https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/409f6a116_918D9A7E-D61E-4658-A7B6-5DF1F8B5AC78.png" alt="The Illest Supply" style="height:56px;mix-blend-mode:screen;"></div><div style="background:#0d0d0d;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:32px;"><div style="text-align:center;margin-bottom:24px;"><div style="font-size:32px;margin-bottom:8px;">✅</div><h2 style="color:#fff;font-size:22px;font-weight:800;letter-spacing:.04em;margin:0 0 6px;">Order Confirmed!</h2><p style="color:#666;font-size:13px;margin:0;">Thanks ${customer_name || 'for your order'} — we got it and we're on it.</p></div><div style="background:#111;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px 18px;margin-bottom:20px;"><div style="font-size:10px;color:#555;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Order Number</div><div style="color:#fff;font-size:15px;font-weight:800;letter-spacing:.06em;">${order_number}</div></div><div style="background:#111;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px 18px;margin-bottom:20px;"><div style="font-size:10px;color:#555;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;">Items Ordered</div>${itemsHtml}</div><div style="background:#111;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px 18px;margin-bottom:20px;"><div style="font-size:10px;color:#555;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;">Order Total</div><div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:6px;"><span>Subtotal</span><span>$${(subtotal||0).toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:6px;"><span>Shipping</span><span>${shipping===0?'FREE':'$'+(shipping||0).toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:10px;"><span>Tax</span><span>$${(tax||0).toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:#fff;border-top:1px solid rgba(255,255,255,.08);padding-top:10px;"><span>Total</span><span>$${(total||0).toFixed(2)}</span></div></div><div style="background:#111;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px 18px;margin-bottom:24px;"><div style="font-size:10px;color:#555;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;">Shipping To</div><div style="color:#aaa;font-size:13px;line-height:1.6;">${addrHtml}</div></div><a href="https://illestsupply.com/order-tracker.html" style="display:block;text-align:center;background:#fff;color:#000;font-size:13px;font-weight:700;letter-spacing:.07em;padding:14px;border-radius:10px;text-decoration:none;margin-bottom:16px;">TRACK YOUR ORDER →</a><p style="color:#444;font-size:12px;text-align:center;margin:0;line-height:1.6;">Questions? DM us at <a href="https://www.instagram.com/theillestsupply" style="color:#666;">@theillestsupply</a><br>or reply to this email</p></div><p style="color:#333;font-size:11px;text-align:center;margin-top:20px;">© 2026 The Illest Supply · illestsupply.com</p></div></div>`;
      await fetch("https://superagent-bc2ec54c.base44.app/functions/sendInquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: customer_email, subject: `Order Confirmed ✅ ${order_number} – The Illest Supply`, body: emailHtml, type: "confirmation" }) });
      return Response.json({ success: true }, { headers: cors });
    }

    // ── SHIPPING EMAIL ────────────────────────────────────────────────────
    if (action === "sendShippingEmail") {
      const { id, customer_name, customer_email, product_name, size, price, tracking_number } = await req.json();
      const trackingUrl = tracking_number ? `https://track.aftership.com/usps/${tracking_number}` : `https://illestsupply.com/order-tracker.html`;
      const emailHtml = `<div style="background:#080808;padding:40px 20px;font-family:'Inter',sans-serif;"><div style="max-width:520px;margin:0 auto;"><div style="text-align:center;margin-bottom:32px;"><img src="https://media.base44.com/images/public/6a21ea02495f72afbc2ec54c/409f6a116_918D9A7E-D61E-4658-A7B6-5DF1F8B5AC78.png" alt="The Illest Supply" style="height:60px;mix-blend-mode:screen;"></div><div style="background:#0d0d0d;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:32px;"><h2 style="color:#fff;font-size:22px;font-weight:800;letter-spacing:.04em;margin:0 0 6px;">Your order is on its way 📦</h2><p style="color:#666;font-size:14px;margin:0 0 24px;">Hey ${customer_name || 'there'}, your order has shipped!</p><div style="background:#111;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:18px;margin-bottom:24px;"><div style="font-size:11px;color:#555;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">Order Summary</div><div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="color:#fff;font-size:14px;font-weight:700;">${product_name || 'Your Item'}</div><div style="color:#555;font-size:12px;margin-top:3px;">Size: ${size || '—'}</div></div><div style="color:#fff;font-size:16px;font-weight:800;">$${price || '—'}</div></div></div>${tracking_number ? `<div style="background:#111;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:18px;margin-bottom:24px;"><div style="font-size:11px;color:#555;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">USPS Tracking</div><div style="color:#fff;font-size:14px;font-weight:700;font-family:monospace;letter-spacing:.05em;">${tracking_number}</div></div>` : ''}<a href="${trackingUrl}" style="display:block;text-align:center;background:#fff;color:#000;font-size:13px;font-weight:700;letter-spacing:.07em;padding:15px;border-radius:10px;text-decoration:none;margin-bottom:20px;">${tracking_number ? 'TRACK MY PACKAGE →' : 'TRACK YOUR ORDER →'}</a><p style="color:#444;font-size:12px;text-align:center;margin:0;line-height:1.6;">Questions? DM us at <a href="https://www.instagram.com/theillestsupply" style="color:#666;">@theillestsupply</a></p></div><p style="color:#333;font-size:11px;text-align:center;margin-top:20px;">© 2026 The Illest Supply · illestsupply.com</p></div></div>`;
      await fetch("https://superagent-bc2ec54c.base44.app/functions/sendInquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: customer_email, subject: `Your order has shipped! ${tracking_number ? '📦 ' + tracking_number : ''}`, body: emailHtml, type: "shipping" }) });
      return Response.json({ success: true }, { headers: cors });
    }

    // ── CREATE ORDER ──────────────────────────────────────────────────────
    if (action === "createOrder") {
      const body = await req.json();
      const orderData = body.order || {};
      const saved = await db.Inquiry.create({
        customer_name: orderData.name || '',
        customer_email: orderData.email || '',
        product_name: (orderData.items||[]).map((i: any) => i.name).join(', '),
        product_id: String((orderData.items||[])[0]?.id || ''),
        size: (orderData.items||[]).map((i: any) => i.size).join(', '),
        price: orderData.total || 0,
        message: JSON.stringify(orderData.address || {}),
        status: 'paid',
        source: 'checkout',
        notes: JSON.stringify({ orderNumber: orderData.orderNumber, items: orderData.items, shipping: orderData.shipping, tax: orderData.tax, phone: orderData.phone })
      });
      return Response.json({ success: true, id: saved.id }, { headers: cors });
    }

    // ── ORDER TRACKER ─────────────────────────────────────────────────────
    if (action === "trackOrder") {
      const { orderNumber, email } = await req.json();
      if (!orderNumber || !email) return Response.json({ error: "Missing fields" }, { status: 400, headers: cors });
      const inquiries = await db.Inquiry.list();
      const order = inquiries.find((o: any) =>
        (o.order_number === orderNumber || o.id?.slice(-8).toUpperCase() === orderNumber.replace('ILS-','').toUpperCase()) &&
        o.customer_email?.toLowerCase() === email.toLowerCase()
      );
      if (!order) return Response.json({ error: "Not found" }, { status: 404, headers: cors });
      return Response.json({
        order: {
          id: order.id,
          orderNumber: order.order_number || 'ILS-' + order.id.slice(-4).toUpperCase(),
          customerName: order.customer_name,
          status: order.status || 'processing',
          items: [{ productId: order.product_id, name: order.product_name, size: order.size, price: order.price, qty: 1, img: null }],
          total: order.price,
          trackingNumber: order.notes?.match(/tracking:(\S+)/i)?.[1] || null,
          createdDate: order.created_date,
        }
      }, { headers: cors });
    }

    return Response.json({ error: "Unknown action" }, { status: 400, headers: cors });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500, headers: cors });
  }
});
