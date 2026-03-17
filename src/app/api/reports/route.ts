import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { startOfMonth, endOfMonth, subMonths, format, startOfYear } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = session.organizationId;
    const now = new Date();
    
    // 1. Monthly Cash Flow (Last 12 Months)
    const last12Months = Array.from({ length: 12 }).map((_, i) => ({
      start: startOfMonth(subMonths(now, i)),
      end: endOfMonth(subMonths(now, i)),
    })).reverse();

    const cashFlow = await Promise.all(
      last12Months.map(async (range) => {
        const [expenseSum, investmentSum] = await Promise.all([
          prisma.expense.aggregate({
            where: { organizationId: orgId, expenseDate: { gte: range.start, lte: range.end } },
            _sum: { amount: true },
          }),
          prisma.investment.aggregate({
            where: { organizationId: orgId, investmentDate: { gte: range.start, lte: range.end } },
            _sum: { amount: true },
          }),
        ]);

        return {
          month: format(range.start, "MMM yy"),
          expenses: expenseSum._sum.amount || 0,
          investments: investmentSum._sum.amount || 0,
        };
      })
    );

    // 2. Category Breakdown (Current Year)
    const yearStart = startOfYear(now);
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: { organizationId: orgId, expenseDate: { gte: yearStart } },
      _sum: { amount: true },
    });

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryBreakdown.map((c) => c.categoryId) } },
    });

    const categoryData = categoryBreakdown.map((c) => ({
      name: categories.find((cat) => cat.id === c.categoryId)?.name || "Other",
      value: c._sum.amount || 0,
    })).sort((a, b) => b.value - a.value);

    // 3. Partner Contribution Ratio
    const partnerInvestments = await prisma.investment.groupBy({
      by: ["partnerId"],
      where: { organizationId: orgId },
      _sum: { amount: true },
    });

    const partners = await prisma.partner.findMany({
      where: { id: { in: partnerInvestments.map((p) => p.partnerId) } },
    });

    const partnerData = partnerInvestments.map((p) => ({
      name: partners.find((part) => part.id === p.partnerId)?.name || "Unknown",
      amount: p._sum.amount || 0,
    }));

    // 4. Top Expenses (This Month)
    const monthStart = startOfMonth(now);
    const topExpenses = await prisma.expense.findMany({
      where: { organizationId: orgId, expenseDate: { gte: monthStart } },
      orderBy: { amount: "desc" },
      take: 5,
      include: { category: true },
    });

    return NextResponse.json({
      cashFlow,
      categoryData,
      partnerData,
      topExpenses,
    });
  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
