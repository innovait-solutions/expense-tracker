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

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
        categoryId: data.categoryId,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        paymentMethod: data.paymentMethod,
        paidByPartnerId: data.paidByPartnerId || null,
        receiptUrl: data.receiptUrl,
      },
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "UPDATE",
      entityType: "EXPENSE",
      entityId: id,
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("Update expense error:", error);
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

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "DELETE",
      entityType: "EXPENSE",
      entityId: id,
    });

    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
