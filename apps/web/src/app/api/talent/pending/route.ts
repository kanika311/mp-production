import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

/**
 * BFF proxy for the pending-talent moderation queue. Requires an admin-level
 * NextAuth session and forwards to the API using the CMS service token.
 */
export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const result = await backendFetch(`/talent/pending${query}`);
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
