import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const notifications: any[] = [];

    // 1. Budget Alerts
    const budgets = await (prisma as any).budget.findMany({
      where: { organizationId: session.organizationId, month, year },
      include: { category: true }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: session.organizationId,
        expenseDate: {
          gte: new Date(year, month, 1),
          lte: new Date(year, month + 1, 0),
        },
      },
    });

    const spendingByCategory = expenses.reduce((acc: any, curr) => {
      acc[curr.categoryId] = (acc[curr.categoryId] || 0) + curr.amount;
      return acc;
    }, {});

    budgets.forEach((budget: any) => {
      const spent = spendingByCategory[budget.categoryId!] || 0;
      const percentage = (spent / budget.amount) * 100;

      if (percentage >= 100) {
        notifications.push({
          id: `budget-exceeded-${budget.id}`,
          type: "ALERT",
          title: "Budget Exceeded",
          message: `You've exceeded the budget for ${budget.category?.name}. Spent ${spent.toLocaleString()} / ${budget.amount.toLocaleString()}.`,
          createdAt: new Date(),
        });
      } else if (percentage >= 80) {
        notifications.push({
          id: `budget-warning-${budget.id}`,
          type: "WARNING",
          title: "Budget Warning",
          message: `You've used ${percentage.toFixed(0)}% of your budget for ${budget.category?.name}.`,
          createdAt: new Date(),
        });
      }
    });

    // 2. Upcoming Recurring Costs (within 3 days)
    const upcomingRecurring = await prisma.recurringExpense.findMany({
      where: {
        organizationId: session.organizationId,
        nextDueDate: {
          gte: now,
          lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      },
    });

    upcomingRecurring.forEach(item => {
      notifications.push({
        id: `recurring-due-${item.id}`,
        type: "INFO",
        title: "Upcoming Payment",
        message: `${item.title} of ${item.amount.toLocaleString()} is due on ${item.nextDueDate.toLocaleDateString()}.`,
        createdAt: new Date(),
      });
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
