import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-dev-only"
);

export type JWTPayload = {
  userId: string;
  organizationId: string;
  role: string;
};

export const signToken = async (payload: JWTPayload) => {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
};

