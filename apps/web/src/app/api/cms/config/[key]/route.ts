import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { key } = await ctx.params;
  // config reads are public on the API
  const result = await backendFetch(`/cms/config/${encodeURIComponent(key)}`);
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { key } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const result = await backendFetch(`/cms/admin/config/${encodeURIComponent(key)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
