import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ key: string }> };

// In-memory cache for local dev / offline resilience
const LOCAL_CONFIG_CACHE: Record<string, any> = {};

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { key } = await ctx.params;
  try {
    const result = await backendFetch(`/cms/config/${encodeURIComponent(key)}`);
    if (result.ok && result.data) {
      return NextResponse.json(result, { status: 200 });
    }
  } catch (err) {
    // API offline, fallback
  }

  if (LOCAL_CONFIG_CACHE[key] !== undefined) {
    return NextResponse.json({ ok: true, success: true, status: 200, data: LOCAL_CONFIG_CACHE[key] }, { status: 200 });
  }

  return NextResponse.json({ ok: false, status: 404, error: 'Config key not found' }, { status: 404 });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { key } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  // Store in local cache
  LOCAL_CONFIG_CACHE[key] = body.value !== undefined ? body.value : body;

  try {
    const result = await backendFetch(`/cms/admin/config/${encodeURIComponent(key)}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (result.ok) {
      return NextResponse.json(result, { status: 200 });
    }
  } catch (err) {
    // Backend offline, fallback to local cache response
  }

  return NextResponse.json({ ok: true, success: true, status: 200, data: LOCAL_CONFIG_CACHE[key] }, { status: 200 });
}

