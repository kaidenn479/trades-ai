import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-this"
);
const COOKIE = "trai_session";

export async function createSession(technicianId: string): Promise<string> {
  return new SignJWT({ technicianId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function getSession(): Promise<{ technicianId: string } | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return { technicianId: payload.technicianId as string };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<{ technicianId: string } | null> {
  try {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return { technicianId: payload.technicianId as string };
  } catch {
    return null;
  }
}

export const COOKIE_NAME = COOKIE;
