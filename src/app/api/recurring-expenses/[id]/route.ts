import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const data = await req.json();

    const recurring = await prisma.recurringExpense.findFirst({
      where: { id, organizationId: session.organizationId },
    });

    if (!recurring) {
      return NextResponse.json({ error: "Recurring expense not found" }, { status: 404 });
    }

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: {
        title: data.title,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        categoryId: data.categoryId,
        frequency: data.frequency,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update recurring error:", error);
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

    const recurring = await prisma.recurringExpense.findFirst({
      where: { id, organizationId: session.organizationId },
    });

    if (!recurring) {
      return NextResponse.json({ error: "Recurring expense not found" }, { status: 404 });
    }

    await prisma.recurringExpense.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete recurring error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
