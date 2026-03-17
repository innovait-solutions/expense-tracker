import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { logActivity } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const partnerId = searchParams.get("partnerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: session.organizationId,
        ...(categoryId && { categoryId }),
        ...(partnerId && { paidByPartnerId: partnerId }),
        ...(type && { type: type as any }),
        ...(startDate && endDate && {
          expenseDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        category: true,
        paidByPartner: true,
      },
      orderBy: {
        expenseDate: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
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
    const { title, description, expenseDate, categoryId, type, amount, paymentMethod, paidByPartnerId, receiptUrl, frequency = "MONTHLY" } = data;

    if (!title || !expenseDate || !categoryId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create expense and potentially a recurring template in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          title,
          description,
          expenseDate: new Date(expenseDate),
          categoryId,
          type: type || "ONE_TIME",
          amount: parseFloat(amount),
          paymentMethod,
          paidByPartnerId,
          receiptUrl,
          organizationId: session.organizationId,
        },
      });

      if (type === "RECURRING") {
        const nextDate = new Date(expenseDate);
        switch (frequency) {
          case "WEEKLY":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "MONTHLY":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "YEARLY":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          case "TWO_YEARS":
            nextDate.setFullYear(nextDate.getFullYear() + 2);
            break;
          case "THREE_YEARS":
            nextDate.setFullYear(nextDate.getFullYear() + 3);
            break;
        }

        await tx.recurringExpense.create({
          data: {
            title,
            categoryId,
            amount: parseFloat(amount),
            frequency: frequency as any,
            nextDueDate: nextDate,
            organizationId: session.organizationId,
          },
        });
      }

      return expense;
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "CREATE",
      entityType: "EXPENSE",
      entityId: result.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
