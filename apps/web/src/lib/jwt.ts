import { SignJWT, jwtVerify, JWTPayload } from 'jose';

export interface SessionPayload extends JWTPayload {
  sub: string;
  id?: string;
  email: string;
  role: string;
  name?: string;
}

const getSecretKey = () => {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    '2a3365b381d4ffa9bb18537696557b280fe3bdd0e00c430d9ec1e0c5a2ddd155';
  return new TextEncoder().encode(secret);
};

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
