"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Target, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

export default function BudgetsPage() {
  const { organization } = useOrganization();
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editingBudget, setEditingBudget] = useState<{ categoryId: string, amount: string } | null>(null);

  const month = date.getMonth();
  const year = date.getFullYear();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, budRes] = await Promise.all([
        axios.get("/api/categories"),
        axios.get(`/api/budgets?month=${month}&year=${year}`)
      ]);
      setCategories(catRes.data);
      setBudgets(budRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    try {
      await axios.post("/api/budgets", {
        categoryId: editingBudget!.categoryId,
        amount: editingBudget!.amount,
        month,
        year
      });
      setMessage({ type: "success", text: "Budget updated successfully!" });
      setEditingBudget(null);
      fetchData();
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update budget" });
    }
  };

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find(b => b.categoryId === categoryId);
  };

  const nextMonth = () => setDate(new Date(year, month + 1, 1));
  const prevMonth = () => setDate(new Date(year, month - 1, 1));

  if (loading && budgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.actualSpending, 0);
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgets & Goals</h2>
          <p className="text-sm text-muted-foreground">Set and track monthly spending limits per category.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-card border rounded-xl p-1 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-4 text-sm font-bold min-w-[140px] text-center">
                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Budget</p>
            <h3 className="text-2xl font-black">{formatCurrency(totalBudget, organization?.currency)}</h3>
        </div>
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Spent</p>
            <h3 className={cn("text-2xl font-black", totalSpent > totalBudget && totalBudget > 0 ? "text-red-500" : "text-foreground")}>
                {formatCurrency(totalSpent, organization?.currency)}
            </h3>
        </div>
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">Utilization</p>
            <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-black">{Math.round(percentUsed)}%</h3>
                {percentUsed > 100 ? <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" /> : null}
            </div>
        </div>
      </div>

      {message.text && (
        <div className={cn(
            "p-4 rounded-xl flex items-center text-xs font-bold",
            message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
        )}>
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 mr-3" /> : <AlertCircle className="h-4 w-4 mr-3" />}
            {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {categories.map((category) => {
          const budget = getBudgetForCategory(category.id);
          const spent = budget?.actualSpending || 0;
          const limit = budget?.amount || 0;
          const percent = limit > 0 ? (spent / limit) * 100 : 0;
          const isOver = spent > limit && limit > 0;

          return (
            <div key={category.id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">
                            {limit > 0 ? `${Math.round(percent)}% of budget used` : "No limit set"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Actual Spent</p>
                        <p className={cn("text-sm font-black", isOver ? "text-red-500" : "text-foreground")}>
                            {formatCurrency(spent, organization?.currency)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Budget Limit</p>
                        {editingBudget?.categoryId === category.id ? (
                            <form onSubmit={handleUpdateBudget} className="flex items-center space-x-2">
                                <input
                                    autoFocus
                                    type="number"
                                    className="w-24 px-2 py-1 text-sm border rounded-lg bg-background"
                                    value={editingBudget.amount}
                                    onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                                />
                                <button type="submit" className="text-primary hover:text-primary/80">
                                    <CheckCircle2 className="h-5 w-5" />
                                </button>
                                <button type="button" onClick={() => setEditingBudget(null)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </form>
                        ) : (
                            <button 
                                onClick={() => setEditingBudget({ categoryId: category.id, amount: limit.toString() })}
                                className="flex items-center text-sm font-black hover:text-primary transition-colors group-hover:bg-primary/5 px-2 py-1 rounded-lg"
                            >
                                {limit > 0 ? formatCurrency(limit, organization?.currency) : "Set Limit"}
                                <Plus className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        )}
                    </div>
                </div>
              </div>

              <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                    className={cn(
                        "absolute top-0 left-0 h-full transition-all duration-500",
                        isOver ? "bg-red-500" : percent > 80 ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(percent || 0, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )
}
