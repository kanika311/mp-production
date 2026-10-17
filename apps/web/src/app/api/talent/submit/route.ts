import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { backendFetch } from '@/lib/cms/server/backend';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();

    const userId = body.userId || session?.user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized: User ID required' }, { status: 401 });
    }

    const email = body.email || session?.user?.email;
    const fullName = body.fullName || body.stageName || session?.user?.name;

    const result = await backendFetch('/talent/submit', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        userId,
        email,
        fullName,
      }),
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to submit profile' },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data || { success: true });
  } catch (error: any) {
    console.error('Submit profile error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to submit profile' },
      { status: 500 }
    );
  }
}
