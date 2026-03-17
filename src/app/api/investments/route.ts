import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const investments = await prisma.investment.findMany({
      where: {
        organizationId: session.organizationId,
      },
      include: {
        partner: true,
      },
      orderBy: {
        investmentDate: "desc",
      },
    });

    return NextResponse.json(investments);
  } catch (error) {
    console.error("Fetch investments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { partnerId, amount, investmentType, investmentDate, notes } = data;

    if (!partnerId || !amount || !investmentDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const investment = await prisma.investment.create({
      data: {
        partnerId,
        amount: parseFloat(amount),
        investmentType: investmentType || "ONE_TIME",
        investmentDate: new Date(investmentDate),
        notes,
        organizationId: session.organizationId,
      },
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "CREATE",
      entityType: "INVESTMENT",
      entityId: investment.id,
    });

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    console.error("Create investment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
