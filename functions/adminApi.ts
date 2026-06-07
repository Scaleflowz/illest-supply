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

  // Use service role so no user token needed
  const client = createClientFromRequest(req, { appId: "6a21ea02495f72afbc2ec54c" });
  const db = client.asServiceRole.entities;

  try {
    // ── AUTH ──────────────────────────────────────────────────────────────
    if (action === "login") {
      const { passcode } = await req.json();
      const users = await db.AdminUser.list();
      const user = users.find((u: any) => u.passcode === passcode && u.active);
      if (!user) return Response.json({ error: "Invalid passcode" }, { status: 401, headers: cors });
      return Response.json({ success: true, user: { id: user.id, name: user.name, role: user.role } }, { headers: cors });
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
          name: data.customer_name,
          email: data.customer_email,
          total_orders: 1,
          total_spent: data.price || 0,
          last_inquiry_date: new Date().toISOString().split("T")[0],
          tags: "New",
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

      const topProducts = Object.entries(byProduct)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      const now = Date.now();
      const trend = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now - (6 - i) * 86400000);
        const label = day.toLocaleDateString("en-US", { weekday: "short" });
        const count = inquiries.filter((inq: any) => new Date(inq.created_date).toDateString() === day.toDateString()).length;
        return { label, count };
      });

      const topCustomers = [...customers]
        .sort((a: any, b: any) => (b.total_spent || 0) - (a.total_spent || 0))
        .slice(0, 5)
        .map((c: any) => ({ name: c.name, email: c.email, total_orders: c.total_orders || 0, total_spent: c.total_spent || 0 }));

      return Response.json({
        total_inquiries: inquiries.length,
        by_status: byStatus,
        top_products: topProducts,
        top_customers: topCustomers,
        estimated_revenue: revenue,
        total_customers: customers.length,
        repeat_buyers: customers.filter((c: any) => (c.total_orders || 0) >= 2).length,
        oos_sizes: inventory.filter((i: any) => !i.in_stock).length,
        trend,
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
      // Send via the inquiry email mechanism — fire and forget to each
      const sendResults = await Promise.allSettled(emails.map((email: string) =>
        fetch("https://api.base44.com/api/apps/6a21ea02495f72afbc2ec54c/functions/sendInquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      // Add email to the drop's notify_list
      const drops = await db.ScheduledDrop.list();
      const drop = drops.find((d: any) => d.product_name === product_name);
      if (drop) {
        const existing = drop.notify_list ? drop.notify_list.split(',').filter(Boolean) : [];
        if (!existing.includes(email)) {
          existing.push(email);
          await db.ScheduledDrop.update(drop.id, { notify_list: existing.join(',') });
        }
      }
      return Response.json({ success: true }, { headers: cors });
    }
    if (action === "notifyOos") {
      const { product_name, size, email } = await req.json();
      // Find inventory item and add to notify list
      const items = await db.InventoryItem.list();
      const item = items.find((i: any) => i.product_name === product_name && i.size === size);
      if (item) {
        const existing = item.notes ? item.notes.split(',').filter(Boolean) : [];
        if (!existing.includes(email)) {
          existing.push(email);
          await db.InventoryItem.update(item.id, { notes: 'notify:' + existing.join(',') });
        }
      }
      return Response.json({ success: true }, { headers: cors });
    }

    return Response.json({ error: "Unknown action" }, { status: 400, headers: cors });

  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500, headers: cors });
  }
});
