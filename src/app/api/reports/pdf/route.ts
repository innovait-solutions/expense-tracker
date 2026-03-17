import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { format } from "date-fns";

export async function GET(req: Request): Promise<Response> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    const organization = await prisma.organization.findUnique({
      where: { id: session.organizationId },
    });

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: session.organizationId,
        expenseDate: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true, paidByPartner: true },
      orderBy: { expenseDate: "asc" },
    });

    const investments = await prisma.investment.findMany({
      where: {
        organizationId: session.organizationId,
        investmentDate: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { partner: true },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvestments = investments.reduce((sum, i) => sum + i.amount, 0);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks: any[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    
    // Header
    doc.fillColor("#444444").fontSize(20).text("FinanceFlow", { align: "right" });
    doc.fontSize(10).text(organization?.name || "Organization Report", { align: "right" });
    doc.moveDown();

    doc.fillColor("#000000").fontSize(18).text(`Financial Summary - ${format(startOfMonth, "MMMM yyyy")}`, { underline: true });
    doc.moveDown();

    // Summary Box
    doc.rect(50, doc.y, 500, 80).fill("#f9f9f9").stroke("#eeeeee");
    const summaryY = doc.y + 15;
    doc.fillColor("#444444").fontSize(12);
    doc.text("Total Investments:", 70, summaryY);
    doc.text("Total Expenses:", 70, summaryY + 20);
    doc.text("Net Cash Flow:", 70, summaryY + 40);

    doc.fillColor("#000000").font("Helvetica-Bold");
    doc.text(`${organization?.currency || "USD"} ${totalInvestments.toLocaleString()}`, 200, summaryY);
    doc.text(`${organization?.currency || "USD"} ${totalExpenses.toLocaleString()}`, 200, summaryY + 20);
    doc.text(`${organization?.currency || "USD"} ${(totalInvestments - totalExpenses).toLocaleString()}`, 200, summaryY + 40);
    doc.font("Helvetica");

    doc.moveDown(5);

    // Expense Table Header
    doc.fontSize(14).text("Expenses Breakdown", { underline: true });
    doc.moveDown();
    
    const tableTop = doc.y;
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Date", 50, tableTop);
    doc.text("Title", 120, tableTop);
    doc.text("Category", 250, tableTop);
    doc.text("Partner", 350, tableTop);
    doc.text("Amount", 480, tableTop, { align: "right" });
    doc.moveDown();
    doc.strokeColor("#aaaaaa").moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table Data
    doc.font("Helvetica").fontSize(9);
    expenses.forEach((expense) => {
        if (doc.y > 700) doc.addPage();
        const y = doc.y;
        doc.text(format(new Date(expense.expenseDate), "MMM d"), 50, y);
        doc.text(expense.title.substring(0, 25), 120, y);
        doc.text(expense.category.name, 250, y);
        doc.text(expense.paidByPartner?.name || "-", 350, y);
        doc.text(expense.amount.toLocaleString(), 480, y, { align: "right" });
        doc.moveDown();
    });

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="FinanceFlow_Report_${month + 1}_${year}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
