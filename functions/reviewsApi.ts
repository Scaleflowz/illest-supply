import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const method = req.method;

    // ── GET: list approved reviews ─────────────────────────
    if (method === 'GET' && action === 'list') {
      const base44 = createClientFromRequest(req);
      const status = url.searchParams.get('status') || 'approved';
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const all = await base44.asServiceRole.entities.Review.list();
      const filtered = all
        .filter((r: any) => r.status === status)
        .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
        .slice(0, limit);
      return Response.json({ success: true, reviews: filtered, total: filtered.length });
    }

    // ── GET: pending reviews (admin) ───────────────────────
    if (method === 'GET' && action === 'pending') {
      const passcode = url.searchParams.get('passcode');
      const VALID = ['ILLEST2025', 'STAFF2025'];
      if (!VALID.includes(passcode || '')) return Response.json({ error: 'Unauthorized' }, { status: 403 });
      const base44 = createClientFromRequest(req);
      const all = await base44.asServiceRole.entities.Review.list();
      const pending = all
        .filter((r: any) => r.status === 'pending')
        .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
      return Response.json({ success: true, reviews: pending, total: pending.length });
    }

    const body = await req.json().catch(() => ({}));

    // ── POST: submit new review ────────────────────────────
    if (method === 'POST' && action === 'submit') {
      const { customerName, email, instagramHandle, productPurchased, rating, reviewTitle, reviewMessage, photoUrl, verifiedPurchase } = body;

      if (!customerName?.trim()) return Response.json({ error: 'Name is required' }, { status: 400 });
      if (!email?.trim() || !email.includes('@')) return Response.json({ error: 'Valid email is required' }, { status: 400 });
      if (!productPurchased?.trim()) return Response.json({ error: 'Product purchased is required' }, { status: 400 });
      if (!rating || rating < 1 || rating > 5) return Response.json({ error: 'Rating (1-5) is required' }, { status: 400 });
      if (!reviewMessage?.trim() || reviewMessage.trim().length < 10) return Response.json({ error: 'Review message must be at least 10 characters' }, { status: 400 });
      if (reviewMessage.trim().length > 1000) return Response.json({ error: 'Review message must be under 1,000 characters' }, { status: 400 });

      const base44 = createClientFromRequest(req);
      const existing = await base44.asServiceRole.entities.Review.list();
      const recent = existing.filter((r: any) =>
        r.email?.toLowerCase() === email.toLowerCase() &&
        new Date(r.created_date).getTime() > Date.now() - 86400000
      );
      if (recent.length >= 2) return Response.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });

      const record = await base44.asServiceRole.entities.Review.create({
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        instagramHandle: instagramHandle?.trim() || '',
        productPurchased: productPurchased.trim(),
        rating: parseInt(rating),
        reviewTitle: reviewTitle?.trim() || '',
        reviewMessage: reviewMessage.trim(),
        photoUrl: photoUrl?.trim() || '',
        verifiedPurchase: verifiedPurchase === true || verifiedPurchase === 'true',
        status: 'pending',
        featured: false,
      });

      return Response.json({ success: true, id: record.id, message: 'Review submitted successfully' });
    }

    // ── POST: moderate review (admin) ──────────────────────
    if (method === 'POST' && action === 'moderate') {
      const { passcode, id, status, verifiedPurchase, featured, reviewTitle, reviewMessage } = body;
      const VALID = ['ILLEST2025', 'STAFF2025'];
      if (!VALID.includes(passcode || '')) return Response.json({ error: 'Unauthorized' }, { status: 403 });
      if (!id) return Response.json({ error: 'Review ID required' }, { status: 400 });

      const update: any = {};
      if (status !== undefined) update.status = status;
      if (verifiedPurchase !== undefined) update.verifiedPurchase = verifiedPurchase;
      if (featured !== undefined) update.featured = featured;
      if (reviewTitle !== undefined) update.reviewTitle = reviewTitle;
      if (reviewMessage !== undefined) update.reviewMessage = reviewMessage;

      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.Review.update(id, update);
      return Response.json({ success: true });
    }

    // ── POST: delete review (admin) ────────────────────────
    if (method === 'POST' && action === 'delete') {
      const { passcode, id } = body;
      const VALID = ['ILLEST2025', 'STAFF2025'];
      if (!VALID.includes(passcode || '')) return Response.json({ error: 'Unauthorized' }, { status: 403 });
      if (!id) return Response.json({ error: 'Review ID required' }, { status: 400 });
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.Review.delete(id);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 404 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
