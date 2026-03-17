import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/logger";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();
    const { partnerId, amount, investmentType, investmentDate, notes } = data;

    const investment = await prisma.investment.update({
      where: {
        id,
        organizationId: session.organizationId,
      },
      data: {
        partnerId,
        amount: parseFloat(amount),
        investmentType,
        investmentDate: new Date(investmentDate),
        notes,
      },
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "UPDATE",
      entityType: "INVESTMENT",
      entityId: investment.id,
    });

    return NextResponse.json(investment);
  } catch (error) {
    console.error("Update investment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.investment.delete({
      where: {
        id,
        organizationId: session.organizationId,
      },
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "DELETE",
      entityType: "INVESTMENT",
      entityId: id,
    });

    return NextResponse.json({ message: "Investment deleted successfully" });
  } catch (error) {
    console.error("Delete investment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
