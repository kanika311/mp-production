import { NextRequest, NextResponse } from 'next/server';
import { getResource } from '@/lib/cms/resources';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });

  const result = await backendFetch(cfg.backend.list);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Failed to load from API', status: result.status },
      { status: result.status || 502 },
    );
  }

  const payload = result.data as unknown;
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as any).data)
      ? (payload as any).data
      : [];

  return NextResponse.json({ ok: true, status: 200, data: Array.isArray(list) ? list : [] });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ ok: false, error: 'Unknown resource' }, { status: 404 });
  if (!cfg.canCreate) {
    return NextResponse.json({ ok: false, error: 'Create not allowed' }, { status: 405 });
  }

  const body = await req.json().catch(() => ({}));
  const result = await backendFetch(cfg.backend.base, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Create failed — is the API running?', status: result.status },
      { status: result.status || 502 },
    );
  }

  return NextResponse.json({ ok: true, status: result.status, data: result.data });
}
