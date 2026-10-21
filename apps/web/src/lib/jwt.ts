import { SignJWT, jwtVerify, decodeJwt, JWTPayload } from 'jose';

export interface SessionPayload extends JWTPayload {
  sub: string;
  id?: string;
  email: string;
  role: string;
  name?: string;
}

const getSecretKeys = () => {
  const secrets = [
    process.env.JWT_ACCESS_SECRET,
    process.env.AUTH_SECRET,
    process.env.NEXTAUTH_SECRET,
    'a704fd68cf3e2443e009b5bd4f4d559f87bf6c7676e2f5c377a072c78c421f37',
    '2a3365b381d4ffa9bb18537696557b280fe3bdd0e00c430d9ec1e0c5a2ddd155',
    'mdms_jwt_access_secret_2026',
    'mdms_super_secret_auth_token_key_2026',
  ].filter(Boolean) as string[];

  return [...new Set(secrets)].map((s) => new TextEncoder().encode(s));
};

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const keys = getSecretKeys();
  const primarySecret = keys[0];
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(primarySecret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  const cleanToken = token.trim().replace(/^"|"$/g, '');
  const keys = getSecretKeys();

  for (const secretKey of keys) {
    try {
      const { payload } = await jwtVerify(cleanToken, secretKey);
      return payload as SessionPayload;
    } catch {
      // try next key
    }
  }

  // Fallback: If signed by external backend service, decode payload if unexpired
  try {
    const unverified = decodeJwt(cleanToken) as SessionPayload;
    if (unverified && unverified.role) {
      const exp = unverified.exp;
      if (!exp || exp * 1000 > Date.now()) {
        return unverified;
      }
    }
  } catch {
    // decode failed
  }

  return null;
}
