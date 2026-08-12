import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource, id } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });
  if (!cfg.canEdit) {
    return NextResponse.json({ ok: false, error: 'Edit not allowed' }, { status: 405 });
  }

  const body = await req.json().catch(() => ({}));

  // Always include the URL id so upsert endpoints update the right row
  // (publish toggle previously sent only { slug, isPublished } and created duplicates).
  const upsertBody = {
    ...body,
    id: body.id || id,
    ...(cfg.idField === 'slug' && !body.slug ? { slug: id } : {}),
  };

  const result =
    cfg.backend.updateMode === 'upsert'
      ? await backendFetch(cfg.backend.base, {
          method: 'POST',
          body: JSON.stringify(upsertBody),
        })
      : await backendFetch(`${cfg.backend.base}/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Update failed', status: result.status },
      { status: result.status || 502 },
    );
  }

  return NextResponse.json({ ok: true, status: result.status, data: result.data });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource, id } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });
  if (!cfg.canDelete) {
    return NextResponse.json({ ok: false, error: 'Delete not allowed' }, { status: 405 });
  }

  const result = await backendFetch(`${cfg.backend.base}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Delete failed', status: result.status },
      { status: result.status || 502 },
    );
  }

  return NextResponse.json({ ok: true, status: result.status, data: result.data });
}
