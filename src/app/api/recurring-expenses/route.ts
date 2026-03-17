import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recurring = await prisma.recurringExpense.findMany({
    where: { organizationId: session.organizationId },
    include: { category: true },
    orderBy: { nextDueDate: "asc" },
  });
  return NextResponse.json(recurring);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { title, categoryId, amount, frequency, nextDueDate } = data;

  const recurring = await prisma.recurringExpense.create({
    data: {
      title,
      categoryId,
      amount: parseFloat(amount),
      frequency,
      nextDueDate: new Date(nextDueDate),
      organizationId: session.organizationId,
    },
  });
  return NextResponse.json(recurring);
}
