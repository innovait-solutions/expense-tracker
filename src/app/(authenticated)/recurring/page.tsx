"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Plus, RotateCcw, Calendar, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

export default function RecurringExpensesPage() {
  const { organization } = useOrganization();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    categoryId: "",
    frequency: "MONTHLY",
    nextDueDate: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    try {
      const [recRes, catRes] = await Promise.all([
        axios.get("/api/recurring-expenses").catch(() => ({ data: [] })),
        axios.get("/api/categories"),
      ]);
      setExpenses(recRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      categoryId: "",
      frequency: "MONTHLY",
      nextDueDate: new Date().toISOString().split("T")[0],
    });
    setEditingRecurring(null);
  };

  const handleAddRecurring = async (e: any) => {
    e.preventDefault();
    try {
      if (editingRecurring) {
        await axios.put(`/api/recurring-expenses/${editingRecurring.id}`, formData);
      } else {
        await axios.post("/api/recurring-expenses", formData);
      }
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingRecurring(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      categoryId: expense.categoryId,
      frequency: expense.frequency,
      nextDueDate: new Date(expense.nextDueDate).toISOString().split("T")[0],
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await axios.delete(`/api/recurring-expenses/${id}`);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recurring Costs</h2>
          <p className="text-sm text-muted-foreground">Manage subscriptions and monthly fixed costs.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Recurring Cost
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
             <div className="col-span-full text-center py-8">Loading...</div>
        ) : expenses.length === 0 ? (
            <div className="col-span-full border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
                <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No recurring costs found. Start by adding your first subscription.</p>
            </div>
        ) : (
          expenses.map((expense: any) => (
            <div key={expense.id} className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold">{expense.title}</h3>
                            <p className="text-xs text-muted-foreground">{expense.category?.name} • {expense.frequency}</p>
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={() => handleEdit(expense)} className="p-1 hover:text-primary transition-colors">
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="p-1 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Upcoming Payment</p>
                        <p className="text-sm font-medium text-amber-500 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {format(new Date(expense.nextDueDate), "MMM dd, yyyy")}
                        </p>
                    </div>
                    <p className="text-xl font-bold tracking-tighter">{formatCurrency(expense.amount, organization?.currency)}</p>
                </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card w-full max-w-lg border rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold mb-4">{editingRecurring ? "Edit Recurring Cost" : "Add Recurring Cost"}</h3>
            <form onSubmit={handleAddRecurring} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Title</label>
                  <input
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.title}
                    placeholder="AWS, Rent, Netflix..."
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background outline-none"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="TWO_YEARS">2 Years</option>
                    <option value="THREE_YEARS">3 Years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background outline-none"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Next Due Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
                >
                  Save Recurring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
