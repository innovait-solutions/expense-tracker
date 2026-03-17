"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Plus, Search, Filter, Trash2, Edit2, Paperclip, FileText, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useOrganization } from "@/hooks/use-organization";

export default function ExpensesPage() {
  const { organization } = useOrganization();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    paidByPartnerId: "",
    paymentMethod: "Credit Card",
    type: "ONE_TIME",
    frequency: "MONTHLY",
    description: "",
    receiptUrl: "",
  });

  const fetchData = async () => {
    try {
      const [expRes, catRes, partRes] = await Promise.all([
        axios.get("/api/expenses"),
        axios.get("/api/categories"),
        axios.get("/api/partners"),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      setPartners(partRes.data);
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
      expenseDate: new Date().toISOString().split("T")[0],
      categoryId: "",
      paidByPartnerId: "",
      paymentMethod: "Credit Card",
      type: "ONE_TIME",
      frequency: "MONTHLY",
      description: "",
      receiptUrl: "",
    });
    setEditingExpense(null);
    setSelectedFile(null);
  };

  const handleAddExpense = async (e: any) => {
    e.preventDefault();
    setUploading(true);
    try {
      let receiptUrl = formData.receiptUrl;

      // Handle file upload if a new file is selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile!);
        const uploadRes = await axios.post("/api/expenses/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        receiptUrl = uploadRes.data.url;
      }

      if (editingExpense) {
        await axios.put(`/api/expenses/${editingExpense.id}`, {
          ...formData,
          amount: parseFloat(formData.amount),
          paidByPartnerId: formData.paidByPartnerId || null,
          receiptUrl,
        });
      } else {
        await axios.post("/api/expenses", {
          ...formData,
          amount: parseFloat(formData.amount),
          paidByPartnerId: formData.paidByPartnerId || undefined,
          receiptUrl,
        });
      }
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      expenseDate: new Date(expense.expenseDate).toISOString().split("T")[0],
      categoryId: expense.categoryId,
      paidByPartnerId: expense.paidByPartnerId || "",
      paymentMethod: expense.paymentMethod,
      type: expense.type,
      frequency: expense.frequency || "MONTHLY",
      description: expense.description || "",
      receiptUrl: expense.receiptUrl || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await axios.delete(`/api/expenses/${id}`);
      fetchData();
    }
  };

  const filteredExpenses = expenses.filter((e: any) => 
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-sm text-muted-foreground">Manage and track your organization's expenses.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Partner</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Receipt</th>
              <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : filteredExpenses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No expenses found.</td></tr>
            ) : (
              filteredExpenses.map((expense: any) => (
                <tr key={expense.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{expense.title}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                        {expense.category?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {expense.paidByPartner?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(expense.expenseDate), "MMM dd, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-red-500 tracking-tighter">
                    {formatCurrency(expense.amount, organization?.currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {expense.receiptUrl ? (
                        <a 
                            href={expense.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                            <Paperclip className="h-3.5 w-3.5" />
                        </a>
                    ) : (
                        <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(expense)} className="p-1 hover:text-primary transition-colors">
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(expense.id)} className="p-1 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card w-full max-w-lg border rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-bold mb-4">{editingExpense ? "Edit Expense" : "Add New Expense"}</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Title</label>
                  <input
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.title}
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
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  />
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
                  <label className="block text-sm font-medium mb-1">Paid By Partner</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background outline-none"
                    value={formData.paidByPartnerId}
                    onChange={(e) => setFormData({ ...formData, paidByPartnerId: e.target.value })}
                  >
                    <option value="">None (Organization)</option>
                    {partners.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expense Type</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="ONE_TIME">One Time</option>
                    <option value="RECURRING">Recurring</option>
                  </select>
                </div>
                {formData.type === "RECURRING" && (
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
                      <option value="TWO_YEARS">Two Years</option>
                      <option value="THREE_YEARS">Three Years</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Receipt / Attachment</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex flex-1 items-center justify-center px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-all">
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            accept="image/*,application/pdf"
                        />
                        <div className="flex items-center text-xs font-semibold text-muted-foreground">
                            {selectedFile ? (
                                <>
                                    <FileText className="h-4 w-4 mr-2 text-primary" />
                                    <span className="text-foreground max-w-[150px] truncate">{selectedFile.name}</span>
                                    <button onClick={(e) => { e.preventDefault(); setSelectedFile(null); }} className="ml-2 p-1 hover:bg-muted rounded text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    {formData.receiptUrl ? "Update Receipt" : "Click to upload receipt"}
                                </>
                            )}
                        </div>
                    </label>
                    {formData.receiptUrl && !selectedFile && (
                        <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                            <ImageIcon className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-bold text-muted-foreground">ATTACHED</span>
                        </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
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
                  disabled={uploading}
                  className="px-8 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 inline-flex items-center"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
