import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/cms/server/backend';
import { requireAdmin } from '@/lib/cms/server/guard';

type Ctx = { params: Promise<{ id: string }> };

/**
 * BFF proxy for fetching full applicant details for moderation review.
 */
export async function GET(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const result = await backendFetch(`/talent/${encodeURIComponent(id)}/review`);
  return NextResponse.json(result, { status: result.ok ? 200 : result.status });
}
