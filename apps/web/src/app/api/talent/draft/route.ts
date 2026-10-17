import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { backendFetch } from '@/lib/cms/server/backend';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const result = await backendFetch('/talent/draft', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        userId: session.user.id,
      }),
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to save draft' },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data || { success: true });
  } catch (error: any) {
    console.error('Save draft error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to save draft' },
      { status: 500 }
    );
  }
}
