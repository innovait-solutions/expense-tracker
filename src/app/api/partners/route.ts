import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/logger";
import { sendPartnerInviteEmail } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const partners = await prisma.partner.findMany({
    where: { 
      organizationId: session.organizationId,
      isArchived: false,
    },
  });
  return NextResponse.json(partners);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email } = await req.json();
  
  // Find inviter and org info for the email
  const [user, organization] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.organization.findUnique({ where: { id: session.organizationId } })
  ]);

  const partner = await prisma.partner.create({
    data: { name, email, organizationId: session.organizationId },
  });

  // Trigger email (don't block the response)
  sendPartnerInviteEmail({
    email,
    partnerName: name,
    organizationName: organization?.name || "FinanceFlow",
    inviterName: user?.name || "A team member",
  }).catch(err => console.error("Immediate email send error:", err));

  await logActivity({
    userId: session.userId,
    organizationId: session.organizationId,
    action: "CREATE",
    entityType: "PARTNER",
    entityId: partner.id,
  });

  return NextResponse.json(partner);
}
