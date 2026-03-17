"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Download, FileText, TrendingUp, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Users, Loader2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ReportsPage() {
  const { organization } = useOrganization();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("/api/reports");
        setData(res.data);
      } catch (err) {
        console.error("Reports Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const exportToCSV = () => {
    if (!data) return;
    
    // Simple export for Cash Flow
    const headers = ["Month", "Investments", "Expenses"];
    const rows = data.cashFlow.map((item: any) => [
      item.month,
      item.investments,
      item.expenses
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `finance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Analytics</h2>
          <p className="text-sm text-muted-foreground">Deep insights into your organization&apos;s cash flow and growth.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-muted transition-all active:scale-95"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </button>
          <button 
            onClick={async () => {
                setExportingPdf(true);
                try {
                    const res = await axios.get("/api/reports/pdf", { responseType: 'blob' });
                    const blob = new Blob([res.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `FinanceFlow_Report_${new Date().getMonth() + 1}_${new Date().getFullYear()}.pdf`;
                    link.click();
                } catch (err) {
                    console.error("PDF Export failed:", err);
                } finally {
                    setExportingPdf(false);
                }
            }}
            disabled={exportingPdf}
            className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {exportingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate Branded PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cash Flow Comparison */}
        <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Cash Flow Comparison</h3>
            <div className="flex items-center space-x-4 text-[10px] font-bold uppercase">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div> Investments</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></div> Expenses</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.cashFlow}>
                <defs>
                  <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => formatCurrency(Number(value), organization?.currency)}
                />
                <Area type="monotone" dataKey="investments" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorInv)" />
                <Area type="monotone" dataKey="expenses" stroke="#fb7185" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Yearly Category Distribution</h3>
          <div className="grid grid-cols-2 items-center">
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    >
                    {data.categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: any) => formatCurrency(Number(value), organization?.currency)}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-3 pl-6">
                {data.categoryData.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center text-xs">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">{c.name}</span>
                        </div>
                        <span className="text-xs font-bold tracking-tighter">{formatCurrency(c.value, organization?.currency)}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Partner Impact */}
        <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Partner Financial Impact</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.partnerData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(value: any) => formatCurrency(Number(value), organization?.currency)}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Expenses This Month */}
        <div className="p-6 bg-card border rounded-2xl shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Largest Payments (Current Month)</h3>
          <div className="space-y-4">
            {data.topExpenses.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">No expenses recorded this month.</p>
            ) : (
                data.topExpenses.map((exp: any, i: number) => (
                   <div key={exp.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                       <div className="flex items-center space-x-3">
                           <div className="w-8 h-8 rounded-lg bg-white border shadow-sm flex items-center justify-center text-xs font-bold text-primary">
                               {i + 1}
                           </div>
                           <div>
                               <p className="text-sm font-bold">{exp.title}</p>
                               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{exp.category?.name}</p>
                           </div>
                       </div>
                       <div className="text-right">
                           <p className="text-sm font-black text-red-500 tracking-tighter">-{formatCurrency(exp.amount, organization?.currency)}</p>
                           <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(exp.expenseDate), 'MMM dd')}</p>
                       </div>
                   </div> 
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
