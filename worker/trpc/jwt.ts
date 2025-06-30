import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

export type AuthenticatedUser = {
  username: string;
};

export async function decodeAndVerifyJwtToken(
  token: string,
  jwtSecret: string
): Promise<AuthenticatedUser | null> {
  try {
    const decodedPayload = await verify(token, jwtSecret);
    if (decodedPayload && typeof decodedPayload.sub === "string") {
      return { username: decodedPayload.sub };
    }
    return null;
  } catch (e) {
    console.error("JWT verification failed", e);
    return null;
  }
}

const EXPIRATION_PERIOD_SECONDS = 365 * 24 * 60 * 60; // 1 year
export async function createJwtToken(
  user: AuthenticatedUser,
  jwtSecret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload & { sub: string } = {
    sub: user.username, // Subject claim (standard for user ID)
    iat: now, // Issued at time
    exp: now + EXPIRATION_PERIOD_SECONDS,
  };

  return sign(payload, jwtSecret);
}