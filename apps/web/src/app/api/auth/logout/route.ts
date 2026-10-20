import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });

  const expireOptions = {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  };

  response.cookies.set('token', '', expireOptions);
  response.cookies.set('mdms_auth_token', '', expireOptions);
  response.cookies.set('next-auth.session-token', '', expireOptions);

  return response;
}
