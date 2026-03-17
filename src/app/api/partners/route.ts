import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/logger";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partners = await prisma.partner.findMany({
    where: { organizationId: session.organizationId },
  });
  return NextResponse.json(partners);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email } = await req.json();
  const partner = await prisma.partner.create({
    data: { name, email, organizationId: session.organizationId },
  });

  await logActivity({
    userId: session.userId,
    organizationId: session.organizationId,
    action: "CREATE",
    entityType: "PARTNER",
    entityId: partner.id,
  });

  return NextResponse.json(partner);
}
