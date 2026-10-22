import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }
    return NextResponse.json({
      ok: true,
      user: session.user,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, user: null, error: error?.message }, { status: 500 });
  }
}
