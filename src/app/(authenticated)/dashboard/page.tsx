"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingDown,
  Clock,
  Wallet,
  Target,
  PieChart as PieChartIcon,
} from "lucide-react";

import { useOrganization } from "@/hooks/use-organization";
import { formatCurrency, cn } from "@/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const { organization } = useOrganization();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/dashboard/summary");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { kpis, charts } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Financial overview and real-time performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Investment", value: kpis.totalInvestments, icon: DollarSign, color: "text-primary" },
          { label: "Total Expenses", value: kpis.totalExpenses, icon: TrendingDown, color: "text-red-500" },
          { label: "Balance", value: kpis.balance, icon: Wallet, color: "text-emerald-500" },
          { label: "Monthly Burn", value: kpis.burnRate, icon: Clock, color: "text-amber-500" },
        ].map((kpi, i) => (
          <div key={i} className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
              <div className={cn("p-1.5 rounded-lg bg-muted/50", kpi.color)}>
                  <kpi.icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tighter">{formatCurrency(kpi.value || 0, organization?.currency)}</p>
            {kpi.label === "Monthly Burn" && (
                <p className="text-[10px] font-medium text-muted-foreground mt-2 inline-flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    Runway: <span className="text-foreground ml-1">{kpis.runway?.toFixed(1)} months</span>
                </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Spending Trend */}
        <div className="p-6 bg-card border rounded-xl shadow-sm lg:col-span-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Spending Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value), organization?.currency)}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="p-6 bg-card border rounded-xl shadow-sm lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Expense Categories</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), organization?.currency)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
              {charts.categoryDistribution.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span>{c.name}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(c.value, organization?.currency)}</span>
                  </div>
              ))}
          </div>
        </div>
      </div>
      
      {/* Partner Comparison */}
      <div className="p-6 bg-card border rounded-xl shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Partner Contribution Analysis</h3>
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.partnerInvestments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value), organization?.currency)}
                />
                <Bar dataKey="amount" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
}

