import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    const partner = await prisma.partner.findFirst({
      where: { id, organizationId: session.organizationId },
      include: {
        _count: {
          select: { expenses: true, investments: true }
        },
        expenses: {
            take: 5,
            orderBy: { expenseDate: 'desc' },
            include: { category: true }
        },
        investments: {
            take: 5,
            orderBy: { investmentDate: 'desc' }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Calculate totals
    const aggregates = await prisma.$transaction([
        prisma.expense.aggregate({
            where: { paidByPartnerId: id },
            _sum: { amount: true }
        }),
        prisma.investment.aggregate({
            where: { partnerId: id },
            _sum: { amount: true }
        })
    ]);

    return NextResponse.json({
        ...partner,
        totalPaid: aggregates[0]._sum.amount || 0,
        totalInvested: aggregates[1]._sum.amount || 0
    });
  } catch (error) {
    console.error("Get partner details error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const { name, email } = await req.json();
    const partner = await prisma.partner.update({
      where: { id },
      data: { name, email },
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "UPDATE",
      entityType: "PARTNER",
      entityId: id,
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Update partner error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    await prisma.partner.update({
      where: { id, organizationId: session.organizationId },
      data: { isArchived: true }
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "ARCHIVE",
      entityType: "PARTNER",
      entityId: id,
    });

    return NextResponse.json({ message: "Partner archived" });
  } catch (error) {
    console.error("Delete partner error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
