import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/logger";
import { sendPartnerInviteEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    // Find partner, inviter and org info
    const [partner, user, organization] = await Promise.all([
      prisma.partner.findFirst({
        where: { id, organizationId: session.organizationId }
      }),
      prisma.user.findUnique({ where: { id: session.userId } }),
      prisma.organization.findUnique({ where: { id: session.organizationId } })
    ]);

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Trigger email (don't block the response)
    const emailResult = await sendPartnerInviteEmail({
      email: partner.email,
      partnerName: partner.name,
      organizationName: organization?.name || "FinanceFlow",
      inviterName: user?.name || "A team member",
    });

    if (!emailResult.success) {
        return NextResponse.json({ 
            error: "Failed to send email. Ensure your Resend domain is verified.",
            details: emailResult.error
        }, { status: 500 });
    }

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "REINVITE",
      entityType: "PARTNER",
      entityId: id,
    });

    return NextResponse.json({ message: "Invitation resent successfully" });
  } catch (error) {
    console.error("Re-invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
