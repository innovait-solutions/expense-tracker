import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.organizationId;

    // KPI Calculations
    const totalExpensesResult = await prisma.expense.aggregate({
      where: { organizationId: orgId },
      _sum: { amount: true },
    });
    const totalExpenses = totalExpensesResult._sum.amount || 0;

    const totalInvestmentsResult = await prisma.investment.aggregate({
      where: { organizationId: orgId },
      _sum: { amount: true },
    });
    const totalInvestments = totalInvestmentsResult._sum.amount || 0;

    const balance = totalInvestments - totalExpenses;

    // Monthly Burn Rate (Average of last 3 months)
    const now = new Date();
    const last3Months = [0, 1, 2].map(i => ({
      start: startOfMonth(subMonths(now, i)),
      end: endOfMonth(subMonths(now, i)),
    }));

    const monthlyExpenses = await Promise.all(
      last3Months.map(range =>
        prisma.expense.aggregate({
          where: {
            organizationId: orgId,
            expenseDate: { gte: range.start, lte: range.end },
          },
          _sum: { amount: true },
        })
      )
    );

    const burnRate = monthlyExpenses.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0) / 3;
    const runway = burnRate > 0 ? balance / burnRate : 0;

    // Budget Utilization (Current Month)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyBudgetResult = await prisma.budget.aggregate({
      where: {
        organizationId: orgId,
        month: currentMonth,
        year: currentYear,
      },
      _sum: { amount: true },
    });
    const monthlyBudget = monthlyBudgetResult._sum.amount || 0;

    const currentMonthSpending = await prisma.expense.aggregate({
      where: {
        organizationId: orgId,
        expenseDate: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      _sum: { amount: true },
    });
    const currentSpending = currentMonthSpending._sum.amount || 0;

    // Charts Data
    // Spending Trend (Last 6 months)
    const last6Months = Array.from({ length: 6 }).map((_, i) => ({
      start: startOfMonth(subMonths(now, i)),
      end: endOfMonth(subMonths(now, i)),
    })).reverse();

    const spendingTrend = await Promise.all(
      last6Months.map(async range => {
        const sum = await prisma.expense.aggregate({
          where: {
            organizationId: orgId,
            expenseDate: { gte: range.start, lte: range.end },
          },
          _sum: { amount: true },
        });
        return {
          month: format(range.start, "MMM"),
          amount: sum._sum.amount || 0,
        };
      })
    );

    // Category Distribution
    const categoryDistribution = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: { organizationId: orgId },
      _sum: { amount: true },
    });

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryDistribution.map(c => c.categoryId) } },
    });

    const categoryData = categoryDistribution.map(c => ({
      name: categories.find(cat => cat.id === c.categoryId)?.name || "Unknown",
      value: c._sum.amount || 0,
    }));

    // Partner Investment Comparison
    const partnerInvestments = await prisma.investment.groupBy({
      by: ["partnerId"],
      where: { organizationId: orgId },
      _sum: { amount: true },
    });

    const partners = await prisma.partner.findMany({
      where: { id: { in: partnerInvestments.map(p => p.partnerId) } },
    });

    const partnerData = partnerInvestments.map(p => ({
      name: partners.find(part => part.id === p.partnerId)?.name || "Unknown",
      amount: p._sum.amount || 0,
    }));

    return NextResponse.json({
      kpis: {
        totalExpenses,
        totalInvestments,
        balance,
        burnRate,
        runway,
        monthlyBudget,
        currentSpending,
      },
      charts: {
        spendingTrend,
        categoryDistribution: categoryData,
        partnerInvestments: partnerData,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
