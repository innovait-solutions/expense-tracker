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

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Fetch budgets for the given month/year
    const budgets = await (prisma as any).budget.findMany({
      where: {
        organizationId: session.organizationId,
        month,
        year,
      },
    });

    // Fetch actual spending for the same period
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: session.organizationId,
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        categoryId: true,
        amount: true,
      },
    });

    // Aggregate expenses by category
    const spendingByCategory = expenses.reduce((acc: any, curr) => {
      acc[curr.categoryId] = (acc[curr.categoryId] || 0) + curr.amount;
      return acc;
    }, {});

    const result = budgets.map((b: any) => ({
      ...b,
      actualSpending: spendingByCategory[b.categoryId!] || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch budgets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId, amount, month, year } = await req.json();

    if (!categoryId || amount === undefined || month === undefined || year === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const budget = await (prisma as any).budget.upsert({
      where: {
        organizationId_categoryId_month_year: {
          organizationId: session.organizationId,
          categoryId,
          month,
          year,
        },
      },
      update: { amount: parseFloat(amount) },
      create: {
        organizationId: session.organizationId,
        categoryId,
        amount: parseFloat(amount),
        month,
        year,
      },
    });

    await logActivity({
      userId: session.userId,
      organizationId: session.organizationId,
      action: "SET_BUDGET",
      entityType: "BUDGET",
      entityId: budget.id,
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Upsert budget error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
