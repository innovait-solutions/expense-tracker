import { cookies } from "next/headers";
import { verifyToken } from "./auth";

export async function getSession() {
  const token = cookies().get("token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

